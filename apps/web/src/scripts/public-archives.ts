type ArchiveRunRecord = {
  dateKey: string;
  bestScore: number;
  attempts: number;
};

const label = document.getElementById("archiveSelectedLabel");
const params = new URLSearchParams(window.location.search);
const selectedDate = params.get("date");
const fallbackDate = label?.getAttribute("data-default-date") || "";
const hasSelectedDateFormat = Boolean(selectedDate && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate));
const selectedDateKey = hasSelectedDateFormat ? selectedDate : null;
const selectedArchive = selectedDateKey
  ? document.querySelector(`[data-archive-date='${selectedDateKey}'][data-archive-tone='archive']`)
  : null;
const activeDate = selectedDateKey && selectedArchive ? selectedDateKey : fallbackDate;
const isFrench = document.documentElement.lang === "fr";

function readArchiveRecords() {
  try {
    const records = JSON.parse(localStorage.getItem("mp_daily_runs") || "{}") as Record<
      string,
      unknown
    >;

    return Object.fromEntries(
      Object.entries(records).filter((entry): entry is [string, ArchiveRunRecord] => {
        const value = entry[1];
        return (
          typeof value === "object" &&
          value !== null &&
          "dateKey" in value &&
          "bestScore" in value &&
          "attempts" in value
        );
      }),
    );
  } catch {
    return {};
  }
}

function formatSelectedLabel(dateKey: string) {
  const prefix = isFrench
    ? label?.getAttribute("data-prefix-fr")
    : label?.getAttribute("data-prefix-en");
  const formatted = new Intl.DateTimeFormat(isFrench ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateKey}T12:00:00`));

  return `${prefix}: ${formatted}`;
}

function formatAttemptLabel(attempts: number) {
  if (isFrench) return attempts > 1 ? `${attempts} tentatives` : "1 tentative";
  return attempts > 1 ? `${attempts} attempts` : "1 attempt";
}

function updateCellFromRecord(cell: Element, record: ArchiveRunRecord | undefined) {
  const status = cell.querySelector("[data-archive-status]");
  const score = cell.querySelector("[data-archive-score]");
  const attempts = cell.querySelector("[data-archive-attempts]");
  const tone = cell.getAttribute("data-archive-tone");

  cell.classList.toggle("has-record", Boolean(record));

  if (!record) {
    return;
  }

  if (status) {
    status.textContent =
      tone === "today"
        ? isFrench
          ? "Joué aujourd'hui"
          : "Played today"
        : isFrench
          ? "Déjà joué"
          : "Played";
  }
  if (score) {
    score.textContent = isFrench ? `${record.bestScore} pts max` : `${record.bestScore} pts best`;
  }
  if (attempts) {
    attempts.textContent = formatAttemptLabel(record.attempts);
  }
}

function updateMonthSummary(drawer: Element) {
  const summary = drawer.querySelector("[data-archive-month-summary]");
  if (!summary) return;

  const playableCells = [...drawer.querySelectorAll("[data-archive-tone='archive']")];
  const playedCount = playableCells.filter((cell) => cell.classList.contains("has-record")).length;
  const availableCount = playableCells.length - playedCount;

  summary.textContent = isFrench
    ? `${playedCount}/${playableCells.length} joués · ${availableCount} disponibles`
    : `${playedCount}/${playableCells.length} played · ${availableCount} available`;
}

function bindArchiveMonthAccordion() {
  const drawers = [...document.querySelectorAll<HTMLDetailsElement>("[data-archive-month]")];

  drawers.forEach((drawer) => {
    drawer.addEventListener("toggle", () => {
      if (!drawer.open) return;

      drawers.forEach((otherDrawer) => {
        if (otherDrawer !== drawer) otherDrawer.open = false;
      });
    });
  });
}

const records = readArchiveRecords();
let activeDrawer: HTMLDetailsElement | null = null;

if (label && activeDate) {
  label.textContent = formatSelectedLabel(activeDate);
}

document.querySelectorAll("[data-archive-date]").forEach((cell) => {
  if (!(cell instanceof HTMLElement)) return;

  const dateKey = cell.getAttribute("data-archive-date") || "";
  const isActive = dateKey === activeDate && cell.getAttribute("data-archive-tone") === "archive";
  cell.classList.toggle("is-active", isActive);
  updateCellFromRecord(cell, records[dateKey]);

  if (isActive) {
    const drawer = cell.closest("details");
    if (drawer instanceof HTMLDetailsElement) activeDrawer = drawer;
  }
});

if (activeDrawer) {
  document.querySelectorAll("[data-archive-month]").forEach((drawer) => {
    if (drawer instanceof HTMLDetailsElement) drawer.open = drawer === activeDrawer;
  });
}

document.querySelectorAll("[data-archive-month]").forEach(updateMonthSummary);
bindArchiveMonthAccordion();
