import {
  getPublicStorageOrigin,
  requestPublicStorage,
} from "./public-storage-bridge";

type StorageKeyPreview = {
  key: string;
  length: number;
  preview: string;
};

type StorageInspection = {
  origin?: string;
  manabuCount?: number;
  bestCount?: number;
  practiceCount?: number;
  keys?: StorageKeyPreview[];
};

type StorageAction =
  | "inspectStorage"
  | "clearBest"
  | "clearPractice"
  | "clearWaitlist"
  | "clearLang"
  | "clearAll";

function getRequiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`Missing maintenance element: ${id}`);
  }
  return element as T;
}

const originCount = getRequiredElement("maint-origin-count");
const originNote = getRequiredElement("maint-origin-note");
const manabuCount = getRequiredElement("maint-manabu-count");
const bestCount = getRequiredElement("maint-best-count");
const practiceCount = getRequiredElement("maint-practice-count");
const keyList = getRequiredElement("maint-key-list");
const emptyState = getRequiredElement("maint-empty");
const status = getRequiredElement("maint-status");
const refreshButton = getRequiredElement<HTMLButtonElement>("maint-refresh");
let statusTimer: number | undefined;

function safePreview(rawValue: unknown): string {
  const value = String(rawValue ?? "");
  return value.length <= 96 ? value : `${value.slice(0, 93)}...`;
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function setStatus(message: string): void {
  window.clearTimeout(statusTimer);
  status.textContent = message;
  status.classList.add("is-visible");
  statusTimer = window.setTimeout(() => {
    status.classList.remove("is-visible");
  }, 2200);
}

function renderKeyList(
  keys: { key: string; length: number; preview: string }[],
): void {
  emptyState.style.display = keys.length ? "none" : "block";
  keyList.innerHTML = keys
    .map(
      (entry) => `
    <div class="maint-key">
      <div class="maint-key-head">
        <div class="maint-key-name">${escapeHtml(entry.key)}</div>
        <span class="maint-key-badge">${escapeHtml(String(entry.length))} chars</span>
      </div>
      <div class="maint-key-preview">${escapeHtml(safePreview(entry.preview))}</div>
    </div>
  `,
    )
    .join("");
}

function renderStorageState(state: StorageInspection): void {
  originCount.textContent = String(state.origin || getPublicStorageOrigin()).replace(
    /^https?:\/\//,
    "",
  );
  originNote.textContent = String(state.origin || getPublicStorageOrigin());
  manabuCount.textContent = String(state.manabuCount || 0);
  bestCount.textContent = String(state.bestCount || 0);
  practiceCount.textContent = String(state.practiceCount || 0);
  renderKeyList(Array.isArray(state.keys) ? state.keys : []);
}

function renderBridgeUnavailable(message: string): void {
  originCount.textContent = "-";
  originNote.textContent = getPublicStorageOrigin();
  manabuCount.textContent = "0";
  bestCount.textContent = "0";
  practiceCount.textContent = "0";
  keyList.innerHTML = "";
  emptyState.style.display = "block";
  emptyState.textContent = `${message} Vérifie que ManabuPlay tourne bien sur ${getPublicStorageOrigin()}.`;
}

async function refreshState(feedbackMessage?: string): Promise<StorageInspection> {
  try {
    const state = await requestPublicStorage<StorageInspection>("inspectStorage");
    renderStorageState(state);
    if (feedbackMessage) {
      setStatus(`${feedbackMessage} (${state.origin})`);
    }
    return state;
  } catch (error) {
    renderBridgeUnavailable(
      error instanceof Error ? error.message : "Bridge maintenance indisponible.",
    );
    setStatus("Bridge maintenance indisponible.");
    throw error;
  }
}

document.querySelectorAll("[data-maint-action]").forEach((button) => {
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  button.addEventListener("click", async () => {
    const action = button.getAttribute("data-maint-action");
    const bridgeAction = {
      "clear-best": "clearBest",
      "clear-practice": "clearPractice",
      "clear-waitlist": "clearWaitlist",
      "clear-lang": "clearLang",
      "clear-all": "clearAll",
    }[action || ""] as StorageAction | undefined;

    if (!bridgeAction) {
      return;
    }

    try {
      const result = await requestPublicStorage<StorageInspection>(bridgeAction);
      if (bridgeAction === "clearWaitlist") {
        await refreshState("Waitlist locale effacée.");
        return;
      }

      renderStorageState(result);
      const messages: Record<string, string> = {
        clearBest: "Records Libre effacés.",
        clearPractice: "Sessions Libre effacées.",
        clearLang: "Préférence de langue réinitialisée.",
        clearAll: "Stockage ManabuPlay vidé.",
      };
      setStatus(`${messages[bridgeAction]} (${result.origin})`);
    } catch (error) {
      renderBridgeUnavailable(
        error instanceof Error ? error.message : "Bridge maintenance indisponible.",
      );
      setStatus("Bridge maintenance indisponible.");
    }
  });
});

refreshButton.addEventListener("click", () => {
  void refreshState("État relu depuis le site public.");
});

await refreshState("Connexion au site public établie.");
