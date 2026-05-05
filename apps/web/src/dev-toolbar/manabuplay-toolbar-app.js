import { defineToolbarApp } from "astro/toolbar";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAILY_RUN_RECORDS_KEY = "mp_daily_runs";
const DAILY_EXACT_KEYS = ["mp_best_daily"];
const ARCHIVE_EXACT_KEYS = ["mp_best_archive"];
const PRACTICE_SCORE_KEYS = ["mp_best_easy", "mp_best_normal", "mp_best_hard", "mp_best_expert"];

function listManabuKeys() {
  return Object.keys(localStorage)
    .filter((key) => key.startsWith("mp_"))
    .sort((left, right) => left.localeCompare(right));
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readStorageJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function writeStorageJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function isDailyKey(key) {
  return (
    DAILY_EXACT_KEYS.includes(key) || key.startsWith("mp_daily") || key.startsWith("mp_best_daily")
  );
}

function isArchiveKey(key) {
  return (
    ARCHIVE_EXACT_KEYS.includes(key) ||
    key.startsWith("mp_archive") ||
    key.startsWith("mp_best_archive")
  );
}

function getDailyKeys() {
  return listManabuKeys().filter(isDailyKey);
}

function getArchiveKeys() {
  return listManabuKeys().filter(isArchiveKey);
}

function removeKeys(keys) {
  let removed = 0;
  for (const key of keys) {
    if (localStorage.getItem(key) === null) continue;
    localStorage.removeItem(key);
    removed += 1;
  }
  return removed;
}

function removeDateEntryFromObjectKey(key, date) {
  const value = readStorageJson(key);
  if (!isPlainObject(value) || !(date in value)) return 0;

  delete value[date];
  if (Object.keys(value).length === 0) {
    localStorage.removeItem(key);
  } else {
    writeStorageJson(key, value);
  }
  return 1;
}

function removeArchiveEntriesFromDailyRunRecords(scope, date) {
  const value = readStorageJson(DAILY_RUN_RECORDS_KEY);
  if (!isPlainObject(value)) return 0;

  const today = getLocalDateKey();
  let removed = 0;

  for (const recordDate of Object.keys(value)) {
    const shouldRemove =
      scope === "all" ? DATE_PATTERN.test(recordDate) && recordDate < today : recordDate === date;

    if (!shouldRemove) continue;

    delete value[recordDate];
    removed += 1;
  }

  if (removed === 0) return 0;

  if (Object.keys(value).length === 0) {
    localStorage.removeItem(DAILY_RUN_RECORDS_KEY);
  } else {
    writeStorageJson(DAILY_RUN_RECORDS_KEY, value);
  }

  return removed;
}

function removeDateScopedKeys(keyPredicate, date) {
  const keys = listManabuKeys().filter((key) => keyPredicate(key) && key.includes(date));
  return removeKeys(keys);
}

function resetDaily(date) {
  let removed = removeKeys(DAILY_EXACT_KEYS);
  removed += removeDateScopedKeys(isDailyKey, date);

  for (const key of getDailyKeys()) {
    removed += removeDateEntryFromObjectKey(key, date);
  }

  return removed;
}

function resetArchives(scope, date) {
  if (scope === "all") {
    return removeKeys(getArchiveKeys()) + removeArchiveEntriesFromDailyRunRecords(scope, date);
  }

  let removed = removeDateScopedKeys(isArchiveKey, date);
  for (const key of getArchiveKeys()) {
    removed += removeDateEntryFromObjectKey(key, date);
  }
  removed += removeArchiveEntriesFromDailyRunRecords(scope, date);

  return removed;
}

function resetPractice() {
  return removeKeys([...PRACTICE_SCORE_KEYS, "mp_practice_sessions"]);
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getArchiveDates() {
  const dates = new Set();
  const today = getLocalDateKey();

  for (const key of getArchiveKeys()) {
    const keyDates = key.match(/\d{4}-\d{2}-\d{2}/g) || [];
    keyDates.forEach((date) => dates.add(date));

    const value = readStorageJson(key);
    if (isPlainObject(value)) {
      Object.keys(value)
        .filter((date) => DATE_PATTERN.test(date))
        .forEach((date) => dates.add(date));
    }
  }

  const dailyRunRecords = readStorageJson(DAILY_RUN_RECORDS_KEY);
  if (isPlainObject(dailyRunRecords)) {
    Object.keys(dailyRunRecords)
      .filter((date) => DATE_PATTERN.test(date) && date < today)
      .forEach((date) => dates.add(date));
  }

  const queryDate = new URLSearchParams(window.location.search).get("date");
  if (queryDate && DATE_PATTERN.test(queryDate)) dates.add(queryDate);

  return [...dates].sort().reverse();
}

function getDefaultArchiveDate() {
  return getArchiveDates()[0] || getLocalDateKey();
}

function formatToday() {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderKeyList(keys) {
  if (keys.length === 0) return "<p>Aucun état local ManabuPlay détecté.</p>";

  return `<ul>${keys.map((key) => `<li><code>${escapeHtml(key)}</code></li>`).join("")}</ul>`;
}

function renderArchiveDatalist(dates) {
  if (dates.length === 0) return "";
  return `<datalist id="mp-archive-dates">${dates
    .map((date) => `<option value="${escapeHtml(date)}"></option>`)
    .join("")}</datalist>`;
}

function getToolbarPlacement() {
  const toolbarRoot = document
    .querySelector("astro-dev-toolbar")
    ?.shadowRoot?.querySelector("#dev-toolbar-root");
  const placement = toolbarRoot?.getAttribute("data-placement");
  return placement === "bottom-left" || placement === "bottom-right" ? placement : "bottom-center";
}

function attachStyles(canvas) {
  const sheet = new CSSStyleSheet();

  sheet.replaceSync(`
    :host {
      color: #e9e5ff;
      font: 14px/1.5 ui-sans-serif, system-ui, sans-serif;
    }

    .mp-panel {
      display: grid;
      gap: 16px;
      width: 100%;
      max-height: min(420px, calc(100vh - 160px));
      min-width: 0;
      overflow: auto;
      padding: 0 4px 0 0;
    }

    .mp-head {
      display: grid;
      gap: 6px;
    }

    .mp-title {
      margin: 0;
      font-size: 18px;
      font-weight: 800;
    }

    .mp-copy,
    .mp-status p,
    .mp-list p,
    .mp-field span,
    .mp-note {
      margin: 0;
      color: #bdb7d8;
    }

    .mp-actions,
    .mp-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .mp-section {
      display: grid;
      gap: 10px;
      border: 1px solid rgba(255, 255, 255, .1);
      border-radius: 12px;
      background: rgba(255, 255, 255, .04);
      padding: 12px;
    }

    .mp-section-title {
      margin: 0;
      color: #fff;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: .08em;
      text-transform: uppercase;
    }

    .mp-form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .mp-field {
      display: grid;
      gap: 5px;
      font-weight: 800;
    }

    .mp-field span {
      font-size: 12px;
      letter-spacing: .04em;
      text-transform: uppercase;
    }

    .mp-input,
    .mp-select {
      min-height: 36px;
      border: 1px solid rgba(255, 255, 255, .14);
      border-radius: 8px;
      background: rgba(2, 6, 23, .78);
      color: #fff;
      font: inherit;
      padding: 0 10px;
    }

    .mp-button {
      min-height: 36px;
      border: 1px solid rgba(34, 211, 238, .28);
      border-radius: 8px;
      background: rgba(34, 211, 238, .1);
      color: #e9fbff;
      cursor: pointer;
      font: inherit;
      font-weight: 800;
      padding: 0 12px;
    }

    .mp-button:hover {
      border-color: rgba(34, 211, 238, .58);
      background: rgba(34, 211, 238, .16);
    }

    .mp-button-danger {
      border-color: rgba(251, 113, 133, .36);
      background: rgba(251, 113, 133, .12);
    }

    .mp-toggle {
      display: inline-flex;
      gap: 8px;
      align-items: center;
      color: #d8d3ef;
      font-weight: 800;
    }

    .mp-status,
    .mp-list {
      display: grid;
      gap: 8px;
      border: 1px solid rgba(255, 255, 255, .1);
      border-radius: 12px;
      background: rgba(255, 255, 255, .04);
      padding: 12px;
    }

    .mp-status strong,
    .mp-list strong {
      color: #fff;
    }

    .mp-message {
      border: 1px solid rgba(34, 211, 238, .22);
      border-radius: 8px;
      background: rgba(34, 211, 238, .08);
      color: #a5f3fc;
      font-weight: 800;
      padding: 8px 10px;
    }

    .mp-list ul {
      display: grid;
      gap: 4px;
      margin: 0;
      padding-left: 18px;
    }

    .mp-list code {
      color: #fef08a;
      font-size: 13px;
    }

    @media (max-width: 640px) {
      .mp-form-grid {
        grid-template-columns: 1fr;
      }
    }
  `);

  canvas.adoptedStyleSheets = [...canvas.adoptedStyleSheets, sheet];
}

function getInputValue(canvas, selector, fallback = "") {
  const input = canvas.querySelector(selector);
  return input instanceof HTMLInputElement || input instanceof HTMLSelectElement
    ? input.value
    : fallback;
}

function shouldReloadAfterReset(canvas) {
  const input = canvas.querySelector("[data-mp-auto-reload]");
  return input instanceof HTMLInputElement ? input.checked : true;
}

function finishAction({ canvas, app, message, reload = false }) {
  app.toggleNotification({ level: "info", state: true });
  render(canvas, app, message);

  if (reload) {
    window.setTimeout(() => window.location.reload(), 120);
  }
}

function render(canvas, app, message = "") {
  const keys = listManabuKeys();
  const dailyKeys = getDailyKeys();
  const archiveKeys = getArchiveKeys();
  const archiveDates = getArchiveDates();
  const today = getLocalDateKey();
  const archiveDate = getDefaultArchiveDate();
  const placement = getToolbarPlacement();

  canvas.innerHTML = `
    <astro-dev-toolbar-window placement="${placement}">
      <div class="mp-panel">
        <div class="mp-head">
          <h2 class="mp-title">Manabu QA</h2>
          <p class="mp-copy">Outil dev local pour tester le quotidien, les archives et l'état quiz sans passer par l'admin.</p>
        </div>

        ${message ? `<div class="mp-message" role="status">${escapeHtml(message)}</div>` : ""}

        <div class="mp-status">
          <p><strong>Page :</strong> ${escapeHtml(window.location.pathname)}</p>
          <p><strong>Date locale :</strong> ${formatToday()}</p>
          <p><strong>Clés quotidien :</strong> ${dailyKeys.length}</p>
          <p><strong>Clés archives :</strong> ${archiveKeys.length}</p>
          <p><strong>Clés ManabuPlay locales :</strong> ${keys.length}</p>
        </div>

        <div class="mp-section">
          <h3 class="mp-section-title">Navigation</h3>
          <div class="mp-actions">
            <button class="mp-button" type="button" data-mp-action="daily">Ouvrir quotidien</button>
            <button class="mp-button" type="button" data-mp-action="archives">Ouvrir archives</button>
            <button class="mp-button" type="button" data-mp-action="read-storage">Relire stockage</button>
            <button class="mp-button" type="button" data-mp-action="reload-page">Recharger page</button>
          </div>
          <p class="mp-note">“Relire stockage” met seulement ce panneau à jour. “Recharger page” relance l'UI publique.</p>
        </div>

        <div class="mp-section">
          <h3 class="mp-section-title">Reset quotidien</h3>
          <p class="mp-note">Reset implicite du quotidien local du jour : ${today}.</p>
          <div class="mp-row">
            <button class="mp-button mp-button-danger" type="button" data-mp-action="reset-daily">Reset quotidien</button>
          </div>
        </div>

        <div class="mp-section">
          <h3 class="mp-section-title">Reset archives</h3>
          <div class="mp-form-grid">
            <label class="mp-field">
              <span>Scope</span>
              <select class="mp-select" data-mp-archive-scope>
                <option value="all">Tout</option>
                <option value="date">Jour particulier</option>
              </select>
            </label>
            <label class="mp-field">
              <span>Date archive</span>
              <input class="mp-input" type="date" list="mp-archive-dates" value="${archiveDate}" data-mp-archive-date />
            </label>
          </div>
          ${renderArchiveDatalist(archiveDates)}
          <div class="mp-row">
            <button class="mp-button mp-button-danger" type="button" data-mp-action="reset-archives">Reset archives</button>
          </div>
          <p class="mp-note">En mode “Jour particulier”, l'outil supprime les entrées datées dans les objets JSON et les clés contenant cette date.</p>
        </div>

        <div class="mp-section">
          <h3 class="mp-section-title">Autres états quiz</h3>
          <label class="mp-toggle">
            <input type="checkbox" data-mp-auto-reload checked />
            Recharger la page après reset
          </label>
          <div class="mp-row">
            <button class="mp-button mp-button-danger" type="button" data-mp-action="reset-practice">Reset libre</button>
          </div>
        </div>

        <div class="mp-list">
          <strong>LocalStorage ManabuPlay</strong>
          ${renderKeyList(keys)}
        </div>
      </div>
    </astro-dev-toolbar-window>
  `;

  canvas.querySelector("[data-mp-action='daily']")?.addEventListener("click", () => {
    window.location.assign("/fr/daily/");
  });

  canvas.querySelector("[data-mp-action='archives']")?.addEventListener("click", () => {
    window.location.assign("/fr/archives/");
  });

  canvas.querySelector("[data-mp-action='read-storage']")?.addEventListener("click", () => {
    render(canvas, app, "État local relu depuis localStorage.");
  });

  canvas.querySelector("[data-mp-action='reload-page']")?.addEventListener("click", () => {
    window.location.reload();
  });

  canvas.querySelector("[data-mp-action='reset-daily']")?.addEventListener("click", () => {
    const reload = shouldReloadAfterReset(canvas);
    const removed = resetDaily(today);
    finishAction({
      canvas,
      app,
      message: `Quotidien ${today} reset : ${removed} clé(s) ou entrée(s) supprimée(s).`,
      reload,
    });
  });

  canvas.querySelector("[data-mp-action='reset-archives']")?.addEventListener("click", () => {
    const scope = getInputValue(canvas, "[data-mp-archive-scope]", "all");
    const date = getInputValue(canvas, "[data-mp-archive-date]", archiveDate);
    const reload = shouldReloadAfterReset(canvas);

    if (scope !== "all" && !DATE_PATTERN.test(date)) {
      finishAction({ canvas, app, message: "Date archive invalide.", reload: false });
      return;
    }

    const removed = resetArchives(scope, date);
    const label = scope === "all" ? "Toutes les archives" : `Archive ${date}`;
    finishAction({
      canvas,
      app,
      message: `${label} reset : ${removed} clé(s) ou entrée(s) supprimée(s).`,
      reload,
    });
  });

  canvas.querySelector("[data-mp-action='reset-practice']")?.addEventListener("click", () => {
    const reload = shouldReloadAfterReset(canvas);
    const removed = resetPractice();
    finishAction({
      canvas,
      app,
      message: `Libre reset : ${removed} clé(s) supprimée(s).`,
      reload,
    });
  });
}

export default defineToolbarApp({
  init(canvas, app) {
    attachStyles(canvas);
    render(canvas, app);
    app.onToolbarPlacementUpdated(({ placement }) => {
      canvas.querySelector("astro-dev-toolbar-window")?.setAttribute("placement", placement);
    });
  },
});
