import { getPublicStorageOrigin, requestPublicStorage } from "./public-storage-bridge";

type WaitlistEntry = {
  email?: string;
  lang?: string;
  createdAt?: string;
  source?: string;
  page?: string;
};

function getRequiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`Missing admin waitlist element: ${id}`);
  }
  return element as T;
}

const body = getRequiredElement("waitlist-body");
const empty = getRequiredElement("waitlist-empty");
const tableWrap = getRequiredElement("waitlist-table-wrap");
const count = getRequiredElement("waitlist-count");
const frCount = getRequiredElement("waitlist-fr-count");
const enCount = getRequiredElement("waitlist-en-count");
const panel = getRequiredElement("waitlist-panel");
const status = getRequiredElement("waitlist-status");
const refreshButton = getRequiredElement<HTMLButtonElement>("waitlist-refresh");
const exportButton = getRequiredElement<HTMLButtonElement>("waitlist-export");
const clearButton = getRequiredElement<HTMLButtonElement>("waitlist-clear");
let statusTimer: number | undefined;
let lastSubmissions: WaitlistEntry[] = [];

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(value: unknown): string {
  if (!value) return "n.c.";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "n.c.";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatExportStamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return (
    [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join("-") +
    "-" +
    pad(date.getHours()) +
    pad(date.getMinutes())
  );
}

function showStatus(message: string): void {
  window.clearTimeout(statusTimer);
  status.textContent = message;
  status.classList.add("is-visible");
  panel.classList.remove("is-refreshing");
  void panel.offsetWidth;
  panel.classList.add("is-refreshing");
  statusTimer = window.setTimeout(() => {
    status.classList.remove("is-visible");
  }, 1800);
}

function renderSubmissions(submissions: WaitlistEntry[]): void {
  lastSubmissions = Array.isArray(submissions) ? submissions : [];

  const fr = lastSubmissions.filter((entry) => entry.lang === "fr").length;
  const en = lastSubmissions.filter((entry) => entry.lang === "en").length;

  count.textContent = String(lastSubmissions.length);
  frCount.textContent = String(fr);
  enCount.textContent = String(en);
  empty.style.display = lastSubmissions.length ? "none" : "block";
  tableWrap.style.display = lastSubmissions.length ? "block" : "none";

  body.innerHTML = lastSubmissions
    .map(
      (entry) => `
    <tr>
      <td class="waitlist-email">${escapeHtml(entry.email)}</td>
      <td>${escapeHtml(String(entry.lang || "n.c.").toUpperCase())}</td>
      <td>${escapeHtml(formatDate(entry.createdAt))}</td>
      <td>${escapeHtml(entry.source || "localStorage")}</td>
      <td>${escapeHtml(entry.page || "/")}</td>
    </tr>
  `,
    )
    .join("");
}

function renderBridgeUnavailable(message: string): void {
  count.textContent = "0";
  frCount.textContent = "0";
  enCount.textContent = "0";
  body.innerHTML = "";
  tableWrap.style.display = "none";
  empty.style.display = "block";
  empty.textContent = `${message} Vérifie que ManabuPlay tourne bien sur ${getPublicStorageOrigin()}.`;
}

async function fetchSubmissions(): Promise<{ origin: string; submissions: WaitlistEntry[] }> {
  const result = await requestPublicStorage<{ origin: string; submissions: WaitlistEntry[] }>(
    "readWaitlist",
  );
  renderSubmissions(result.submissions);
  return result;
}

async function refreshWithFeedback(): Promise<void> {
  try {
    const result = await fetchSubmissions();
    const time = new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date());
    showStatus(
      result.submissions.length
        ? `${result.submissions.length} email${result.submissions.length > 1 ? "s" : ""} relu${result.submissions.length > 1 ? "s" : ""} via ${result.origin} à ${time}.`
        : `Aucun email trouvé sur ${result.origin} à ${time}.`,
    );
  } catch (error) {
    renderBridgeUnavailable(
      error instanceof Error ? error.message : "Bridge waitlist indisponible.",
    );
    showStatus("Bridge waitlist indisponible.");
  }
}

function exportCsv(): void {
  const header = ["email", "lang", "createdAt", "source", "page"];
  const rows = lastSubmissions.map((entry) =>
    header
      .map((key) => {
        const value = String(entry[key as keyof WaitlistEntry] ?? "").replace(/"/g, '""');
        return `"${value}"`;
      })
      .join(","),
  );
  const blob = new Blob([[header.join(","), ...rows].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `manabuplay-waitlist-local-${formatExportStamp(new Date())}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

refreshButton.addEventListener("click", () => {
  void refreshWithFeedback();
});
exportButton.addEventListener("click", exportCsv);
clearButton.addEventListener("click", async () => {
  try {
    const result = await requestPublicStorage<{ origin: string; submissions: WaitlistEntry[] }>(
      "clearWaitlist",
    );
    renderSubmissions(result.submissions);
    showStatus(`Waitlist locale effacée sur ${result.origin}.`);
  } catch (error) {
    renderBridgeUnavailable(
      error instanceof Error ? error.message : "Bridge waitlist indisponible.",
    );
    showStatus("Bridge waitlist indisponible.");
  }
});

await refreshWithFeedback();
