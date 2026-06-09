type ArchiveRunRecord = {
  dateKey: string;
  bestScore: number;
  attempts: number;
};

const label = document.getElementById("archiveSelectedLabel");
const archiveShell = document.getElementById("archives-list");
const params = new URLSearchParams(window.location.search);
const selectedDate = params.get("date");
const fallbackDate = label?.getAttribute("data-default-date") || "";
const hasSelectedDateFormat = Boolean(selectedDate && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate));
const selectedDateKey = hasSelectedDateFormat ? selectedDate : null;
const selectedArchive = selectedDateKey
  ? document.querySelector(`[data-archive-date='${selectedDateKey}'][data-archive-tone='archive']`)
  : null;
let activeDate = selectedDateKey && selectedArchive ? selectedDateKey : fallbackDate;
const isFrench = document.documentElement.lang === "fr";
const archiveLabels = archiveShell?.dataset || {};

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
  const prefix = archiveLabels.selectedPrefix || "Selected day";
  const formatted = new Intl.DateTimeFormat(isFrench ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateKey}T12:00:00`));

  return `${prefix}: ${formatted}`;
}

function formatAttemptLabel(attempts: number) {
  const singular = archiveLabels.attemptSingular || "attempt";
  const plural = archiveLabels.attemptPlural || "attempts";
  return `${attempts} ${attempts > 1 ? plural : singular}`;
}

function updateCellFromRecord(cell: Element, record: ArchiveRunRecord | undefined) {
  const score = cell.querySelector("[data-archive-score]");
  const attempts = cell.querySelector("[data-archive-attempts]");
  const action = cell.querySelector("[data-archive-action]");
  const medal = cell.querySelector("[data-archive-medal]");

  cell.classList.toggle("has-record", Boolean(record));
  if (medal instanceof HTMLElement) medal.hidden = !record;

  if (!record) {
    if (action) {
      action.textContent = archiveLabels.playAction || "Play";
    }
    return;
  }

  if (score) {
    const suffix = archiveLabels.scoreBestSuffix || "pts best";
    score.textContent = suffix.startsWith("/")
      ? `${record.bestScore}${suffix}`
      : `${record.bestScore} ${suffix}`;
  }
  if (attempts) {
    attempts.textContent = formatAttemptLabel(record.attempts);
  }
  if (action) {
    action.textContent = archiveLabels.replayAction || "Replay";
  }
}

function updateMonthSummary(drawer: Element) {
  const summary = drawer.querySelector("[data-archive-month-summary]");
  if (!summary) return;

  const playableCells = [
    ...drawer.querySelectorAll(".archive-calendar-view--grid [data-archive-tone='archive']"),
  ];
  const playedCount = playableCells.filter((cell) => cell.classList.contains("has-record")).length;

  summary.textContent = `${playedCount}/${playableCells.length} ${archiveLabels.summaryPlayed || "played"}`;
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
const archiveBackCalendar = document.getElementById("archiveBackCalendar");
const archivesList = document.getElementById("archives-list");

function setArchiveInPlay(active: boolean) {
  if (archiveBackCalendar instanceof HTMLButtonElement) {
    archiveBackCalendar.hidden = !active;
  }
}

window.addEventListener("manabuplay:archive-in-play", (event) => {
  const detail = (event as CustomEvent<{ active?: boolean }>).detail;
  setArchiveInPlay(Boolean(detail?.active));
});

archiveBackCalendar?.addEventListener("click", () => {
  archivesList?.scrollIntoView({ behavior: "smooth", block: "start" });
});

if (label && activeDate) {
  label.textContent = formatSelectedLabel(activeDate);
}

function syncActiveArchiveDate(dateKey: string, options: { updateUrl?: boolean } = {}) {
  activeDate = dateKey;
  if (label) label.textContent = formatSelectedLabel(activeDate);

  let nextActiveDrawer: HTMLDetailsElement | null = null;
  document.querySelectorAll("[data-archive-date]").forEach((cell) => {
    if (!(cell instanceof HTMLElement)) return;
    const isActive = cell.getAttribute("data-archive-date") === activeDate;
    cell.classList.toggle("is-active", isActive);
    if (isActive) {
      const drawer = cell.closest("details");
      if (drawer instanceof HTMLDetailsElement) nextActiveDrawer = drawer;
    }
  });

  if (nextActiveDrawer) {
    document.querySelectorAll("[data-archive-month]").forEach((drawer) => {
      if (drawer instanceof HTMLDetailsElement) drawer.open = drawer === nextActiveDrawer;
    });
  }

  if (options.updateUrl) {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("date", activeDate);
    nextUrl.hash = "";
    history.replaceState(null, "", nextUrl);
  }

  window.dispatchEvent(
    new CustomEvent("manabuplay:archive-date-selected", { detail: { dateKey: activeDate } }),
  );
}

document.querySelectorAll("[data-archive-date]").forEach((cell) => {
  if (!(cell instanceof HTMLElement)) return;

  const dateKey = cell.getAttribute("data-archive-date") || "";
  const isActive = dateKey === activeDate && cell.getAttribute("data-archive-tone") === "archive";
  cell.classList.toggle("is-active", isActive);
  if (cell instanceof HTMLAnchorElement) {
    cell.addEventListener("click", (event) => {
      event.preventDefault();
      const isActionClick =
        event.target instanceof Element && Boolean(event.target.closest("[data-archive-action]"));

      if (!cell.classList.contains("is-active")) {
        syncActiveArchiveDate(dateKey, { updateUrl: true });
        return;
      }

      if (isActionClick) {
        history.replaceState(null, "", `${window.location.pathname}${window.location.search}#quiz`);
        document.getElementById("quiz")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }
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
