import {
  buildDailyQuizData,
  buildQuestions,
  getDailyRunRecord,
  getSessionDateKey,
  hasCompletedDailyRun,
  saveArchiveRunCompletion,
  saveDailyRunCompletion,
  savePracticeSession,
} from "./quiz-app/session";
import {
  createRevealObserver,
  createShareController,
  createWaitlistController,
} from "./quiz-app/engagement";
import type {
  BootTranslationValue,
  Difficulty,
  QuizBootData,
  QuizEntry,
  QuizQuestion,
  ResultTier,
  RuntimeState,
  StorageAdapter,
} from "./quiz-app/runtime-types";

type QuizAction =
  | "launchQuiz"
  | "revealHint"
  | "nextQuestion"
  | "replayDifficulty"
  | "goToDiffPicker"
  | "shareOnX"
  | "copyShareLink";

type QuizActionHandler = (element: HTMLElement) => void;

const bootData = window.__MANABUPLAY_DATA__ as QuizBootData | undefined;
if (!bootData) {
  throw new Error("ManabuPlay boot data is missing.");
}
const MANABUPLAY_BOOT: QuizBootData = bootData;

const MANABUPLAY_MODE = MANABUPLAY_BOOT.mode || window.__MANABUPLAY_MODE__ || "legacy";
const DIFFICULTIES = MANABUPLAY_BOOT.difficulties;
const IS_SINGLE_RUN_MODE = MANABUPLAY_MODE === "daily" || MANABUPLAY_MODE === "archives";
const WAITLIST_STORAGE_KEY = "waitlist_submissions";
const WAITLIST_FORM_NAME = "manabuplay-waitlist";
const WAITLIST_SUCCESS_BUTTON_DELAY = 2800;
const WAITLIST_SUCCESS_MESSAGE_DELAY = 4000;
const SUPPORTED_LANGS = ["en", "fr"] as const;
const LOCALIZED_ROUTES = ["daily", "arcade", "archives"] as const;
const PRACTICE_HISTORY_KEY = "practice_sessions";
const PRACTICE_HISTORY_LIMIT = 8;
const LANG = MANABUPLAY_BOOT.lang;
const ANSWER_BUTTON_CLASS = "answer-btn";
const ANSWER_KEY_CLASS = "answer-key";
const ANSWER_COPY_CLASS = "answer-copy";
const QUESTION_POINTS_BY_HINT_STAGE = [10, 8, 5] as const;
const COMBO_MULTIPLIER_STEP = 0.1;
const MAX_COMBO_MULTIPLIER_STREAK = 10;

let currentDiff: Difficulty | null = IS_SINGLE_RUN_MODE ? (DIFFICULTIES[0] ?? null) : null;
let hintStage = 0;
let state: RuntimeState = {
  questions: [],
  currentIndex: 0,
  score: 0,
  streak: 0,
  bestStreak: 0,
  answered: false,
  correct: 0,
};

const LS: StorageAdapter = {
  get<T = unknown>(key: string): T | null {
    try {
      return JSON.parse(localStorage.getItem(`mp_${key}`) || "null") as T | null;
    } catch {
      return null;
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(`mp_${key}`, JSON.stringify(value));
    } catch {
      // Ignore localStorage write failures in private mode or restricted browsers.
    }
  },
  getBest(diffId: string): number {
    return LS.get<number>(`best_${diffId}`) || 0;
  },
  setBest(diffId: string, score: number): boolean {
    const previousBest = LS.getBest(diffId);
    if (score > previousBest) {
      LS.set(`best_${diffId}`, score);
      return true;
    }
    return false;
  },
  getLang(): string {
    return LS.get<string>("lang") || "en";
  },
  setLang(lang: string) {
    LS.set("lang", lang);
  },
};

const pageLocale = SUPPORTED_LANGS.includes(
  window.__MANABUPLAY_LOCALE__ as (typeof SUPPORTED_LANGS)[number],
)
  ? window.__MANABUPLAY_LOCALE__
  : null;
const currentLang =
  pageLocale ||
  (SUPPORTED_LANGS.includes(LS.getLang() as (typeof SUPPORTED_LANGS)[number])
    ? LS.getLang()
    : "en");

const t = (key: string): BootTranslationValue =>
  (LANG[currentLang]?.[key] ?? LANG.en?.[key]) as BootTranslationValue;

function getResults(): ResultTier[] {
  const results = t("results");
  return Array.isArray(results) ? (results as ResultTier[]) : [];
}

function formatBestScoreMessage(score: number, diff: string): string {
  return currentLang === "fr"
    ? `Meilleur score en ${diff} : <strong class="best-score-highlight">${score} pts</strong>`
    : `Best score on ${diff}: <strong class="best-score-highlight">${score} pts</strong>`;
}

function formatCorrectFeedback(points: number): string {
  return currentLang === "fr" ? `✓ Correct ! +${points} pts` : `✓ Correct! +${points} pts`;
}

function formatComboFeedback(streak: number, points: number): string {
  return currentLang === "fr"
    ? `🔥 Série x${streak} ! +${points} pts`
    : `🔥 Streak x${streak}! +${points} pts`;
}

function formatWrongFeedback(answer: string): string {
  return currentLang === "fr" ? `✗ Réponse : "${answer}"` : `✗ Answer: "${answer}"`;
}

function getHintAdjustedQuestionPoints(hintsUsed: number): number {
  const cappedHintStage = Math.min(
    Math.max(hintsUsed, 0),
    QUESTION_POINTS_BY_HINT_STAGE.length - 1,
  );
  return QUESTION_POINTS_BY_HINT_STAGE[cappedHintStage] ?? QUESTION_POINTS_BY_HINT_STAGE[0];
}

function getComboMultiplier(bestStreak: number) {
  return 1 + Math.min(Math.max(bestStreak, 0), MAX_COMBO_MULTIPLIER_STREAK) * COMBO_MULTIPLIER_STEP;
}

function getMaxFinalScore(total: number) {
  return total * QUESTION_POINTS_BY_HINT_STAGE[0] * 2;
}

function formatComboMultiplier(value: number) {
  return `x${value.toFixed(1)}`;
}

function getCompletedDailyRunRecord() {
  if (MANABUPLAY_MODE !== "daily") return null;
  return getDailyRunRecord(LS, sessionDateKey);
}

function isDailyRunLocked() {
  return MANABUPLAY_MODE === "daily" && hasCompletedDailyRun(LS, sessionDateKey);
}

function getDailyLockedButtonLabel() {
  return currentLang === "fr" ? "Déjà joué aujourd'hui" : "Already played today";
}

function syncDailyLaunchControls() {
  const locked = isDailyRunLocked();
  document.querySelectorAll<HTMLElement>("[data-quiz-action='launchQuiz']").forEach((element) => {
    element.classList.toggle("is-disabled", locked);
    element.setAttribute("aria-disabled", locked ? "true" : "false");

    if (element instanceof HTMLButtonElement) {
      element.disabled = locked;
    }

    if (!element.dataset.quizDefaultText) {
      element.dataset.quizDefaultText = element.textContent?.trim() || "";
    }

    if (locked) {
      element.textContent = getDailyLockedButtonLabel();
    } else if (element.dataset.quizDefaultText) {
      element.textContent = element.dataset.quizDefaultText;
    }
  });
}

function syncResultReplayControls() {
  const replayButton = document.querySelector<HTMLElement>("[data-quiz-action='replayDifficulty']");
  if (!(replayButton instanceof HTMLButtonElement)) return;

  const isDailyResultLocked = MANABUPLAY_MODE === "daily" && isDailyRunLocked();
  replayButton.disabled = isDailyResultLocked;
  replayButton.classList.toggle("is-disabled", isDailyResultLocked);
  replayButton.setAttribute("aria-disabled", isDailyResultLocked ? "true" : "false");

  if (isDailyResultLocked) {
    replayButton.textContent = currentLang === "fr" ? "Déjà joué" : "Already played";
  }
}

const RAW_QUIZ_DATA = MANABUPLAY_BOOT.quizData;
let sessionDateKey = getSessionDateKey({
  mode: MANABUPLAY_MODE,
  archiveConfig: MANABUPLAY_BOOT.archive || {},
  search: window.location.search,
});
function buildQuizDataForSessionDate(dateKey: string): QuizEntry[] {
  return MANABUPLAY_MODE === "daily" || MANABUPLAY_MODE === "archives"
    ? buildDailyQuizData({
        pool: RAW_QUIZ_DATA,
        dateKey,
        dailyConfig: MANABUPLAY_BOOT.daily || {},
      })
    : RAW_QUIZ_DATA;
}

let quizData = buildQuizDataForSessionDate(sessionDateKey);

function localizedPath(lang: string, route: string): string {
  return `/${lang}/${route ? `${route}/` : ""}`;
}

function getCurrentLocalizedRoute(): string {
  const parts = window.location.pathname.split("/").filter(Boolean);
  if (!SUPPORTED_LANGS.includes(parts[0] as (typeof SUPPORTED_LANGS)[number])) return "";
  return LOCALIZED_ROUTES.includes(parts[1] as (typeof LOCALIZED_ROUTES)[number]) ? parts[1] : "";
}

function getLocalizedField(value: string | Record<string, string | undefined> | undefined): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[currentLang] || value.en || "";
}

function getRequiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`Required element #${id} is missing.`);
  }
  return element as T;
}

function showElement(element: HTMLElement, displayClass?: string) {
  element.hidden = false;
  if (displayClass) {
    element.classList.add(displayClass);
  }
}

function hideElement(element: HTMLElement, displayClass?: string) {
  element.hidden = true;
  if (displayClass) {
    element.classList.remove(displayClass);
  }
}

function updateLocalizedLinks() {
  const route = getCurrentLocalizedRoute();
  const currentSearch = window.location.search;
  document.querySelectorAll<HTMLAnchorElement>("[data-public-route]").forEach((link) => {
    const targetRoute = link.dataset.publicRoute;
    if (
      targetRoute &&
      LOCALIZED_ROUTES.includes(targetRoute as (typeof LOCALIZED_ROUTES)[number])
    ) {
      link.setAttribute("href", localizedPath(currentLang, targetRoute));
    }
  });
  document.querySelectorAll<HTMLAnchorElement>("[data-locale-home]").forEach((link) => {
    const targetLang = link.dataset.localeHome;
    if (targetLang && SUPPORTED_LANGS.includes(targetLang as (typeof SUPPORTED_LANGS)[number])) {
      const searchSuffix = route === "archives" ? currentSearch : "";
      link.setAttribute("href", localizedPath(targetLang, route) + searchSuffix);
    }
  });
}

function buildQuestionsForCurrentDiff(wordCount: number): QuizQuestion[] {
  return buildQuestions({
    mode: MANABUPLAY_MODE,
    count: wordCount,
    quizData,
    rawQuizData: RAW_QUIZ_DATA,
    currentLang,
    currentDiff,
    sessionDateKey,
    boot: MANABUPLAY_BOOT,
    storage: LS,
    historyKey: PRACTICE_HISTORY_KEY,
  });
}

function applyLang() {
  const htmlRoot = document.getElementById("htmlRoot");
  if (htmlRoot) {
    htmlRoot.lang = currentLang;
  }

  const seoTitle = t("seo_title");
  if (typeof seoTitle === "string" && seoTitle) {
    document.title = seoTitle;
  }

  const seoDescription = t("seo_description");
  if (typeof seoDescription === "string" && seoDescription) {
    const metaDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", seoDescription);
    }
  }

  const ogDescription = t("og_description");
  if (typeof ogDescription === "string" && ogDescription) {
    const ogMetaDescription = document.querySelector<HTMLMetaElement>(
      'meta[property="og:description"]',
    );
    if (ogMetaDescription) {
      ogMetaDescription.setAttribute("content", ogDescription);
    }
  }

  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((element) => {
    const value = t(element.dataset.i18n || "");
    if (typeof value === "string") element.innerHTML = value;
  });
  document.querySelectorAll<HTMLInputElement>("[data-i18n-ph]").forEach((element) => {
    const value = t(element.dataset.i18nPh || "");
    element.placeholder = typeof value === "string" ? value : "";
  });
  document.querySelectorAll<HTMLElement>("[data-aria-label-en]").forEach((element) => {
    const label = currentLang === "fr" ? element.dataset.ariaLabelFr : element.dataset.ariaLabelEn;
    if (label) element.setAttribute("aria-label", label);
  });
  document.getElementById("btnEN")?.classList.toggle("active", currentLang === "en");
  document.getElementById("btnFR")?.classList.toggle("active", currentLang === "fr");
  updateLocalizedLinks();

  const copyButton = document.getElementById("shareBtnCopy");
  const copyLabel = document.getElementById("copyBtnLabel");
  if (copyButton && copyLabel && !copyButton.classList.contains("copied")) {
    const label = t("result_share_copy");
    copyLabel.textContent = typeof label === "string" ? label : "";
  }

  renderDiffGrid();

  const nextButton = document.getElementById("nextBtn");
  if (nextButton && !nextButton.classList.contains("opacity-0")) {
    const label =
      state.currentIndex >= state.questions.length - 1 ? t("see_results") : t("next_word");
    nextButton.textContent = typeof label === "string" ? label : "";
  }
}

function isQuizDensityTight() {
  const hintReveal1 = document.getElementById("hintReveal1");
  const hintReveal2 = document.getElementById("hintReveal2");
  const explanationBox = document.getElementById("explanationBox");

  const hintsOpen =
    (hintReveal1 instanceof HTMLElement && !hintReveal1.hidden) ||
    (hintReveal2 instanceof HTMLElement && !hintReveal2.hidden);
  const explanationOpen = explanationBox instanceof HTMLElement && !explanationBox.hidden;

  return hintsOpen || explanationOpen;
}

function syncShellLaunchLayout() {
  const quizShell = document.querySelector<HTMLElement>(".quiz-shell");
  const diffArea = document.getElementById("diffArea");
  const quizArea = document.getElementById("quizArea");
  const resultsArea = document.getElementById("resultsArea");
  const quizSection = document.getElementById("quiz");
  const isPreLaunch =
    diffArea instanceof HTMLElement &&
    !diffArea.hidden &&
    quizArea instanceof HTMLElement &&
    quizArea.hidden &&
    resultsArea instanceof HTMLElement &&
    resultsArea.hidden;
  const isInPlay = quizArea instanceof HTMLElement && !quizArea.hidden;
  const isInResults = resultsArea instanceof HTMLElement && !resultsArea.hidden;
  const densityTight = isInPlay && isQuizDensityTight();

  quizShell?.classList.toggle("is-pre-launch", isPreLaunch);
  quizShell?.classList.toggle("is-in-play", isInPlay);
  quizShell?.classList.toggle("is-in-results", isInResults);
  quizShell?.classList.toggle("is-density-tight", densityTight);
  quizSection?.classList.toggle("public-quiz-section--pre-launch", isPreLaunch);
  quizSection?.classList.toggle("public-quiz-section--in-play", isInPlay);
  quizSection?.classList.toggle("public-quiz-section--in-results", isInResults);
}

function renderDiffGrid() {
  const grid = document.getElementById("diffGrid");
  const titleScreen = document.getElementById("quizTitleScreen");
  const pickerTitle = document.getElementById("diffPickerTitle");
  const startButton = getRequiredElement<HTMLButtonElement>("startBtn");
  const defaultStartSlot = document.getElementById("defaultStartSlot");
  const singleRunStartSlot = document.getElementById("singleRunStartSlot");
  if (!(grid instanceof HTMLElement)) return;

  if (pickerTitle instanceof HTMLElement) {
    pickerTitle.hidden = IS_SINGLE_RUN_MODE;
  }

  grid.innerHTML = "";
  grid.hidden = IS_SINGLE_RUN_MODE;
  if (titleScreen instanceof HTMLElement) {
    titleScreen.hidden = !IS_SINGLE_RUN_MODE;
  }

  if (IS_SINGLE_RUN_MODE) {
    if (
      singleRunStartSlot instanceof HTMLElement &&
      startButton.parentElement !== singleRunStartSlot
    ) {
      singleRunStartSlot.appendChild(startButton);
    }
    renderSingleRunTitleScreen();
    if (currentDiff) {
      startButton.classList.add("ready");
    }
    syncShellLaunchLayout();
    return;
  }

  if (defaultStartSlot instanceof HTMLElement && startButton.parentElement !== defaultStartSlot) {
    defaultStartSlot.appendChild(startButton);
  }

  DIFFICULTIES.forEach((difficulty) => {
    const best = LS.getBest(difficulty.id);
    const diffBestLabel = t("diff_best");
    const diffNoBestLabel = t("diff_no_best");
    const bestLabel =
      best > 0
        ? `${typeof diffBestLabel === "string" ? diffBestLabel : "Best:"} <span class="diff-best-value ${difficulty.cls}">${best} pts</span>`
        : `<span class="diff-no-best">${typeof diffNoBestLabel === "string" ? diffNoBestLabel : "No record"}</span>`;
    const bestMarkup =
      MANABUPLAY_MODE === "archives" ? "" : `<div class="diff-best mt-1">${bestLabel}</div>`;
    const diffWordsLabel = t("diff_words");
    const diffTitle = t(`diff_${difficulty.id}`);
    const card = document.createElement("div");
    card.className = `diff-card ${difficulty.cls}${currentDiff?.id === difficulty.id ? " selected" : ""}`;
    card.dataset.diffId = difficulty.id;
    card.innerHTML = `
      <span class="diff-icon">${difficulty.icon}</span>
      <div class="diff-name">${typeof diffTitle === "string" ? diffTitle : difficulty.id}</div>
      <div class="diff-count">${difficulty.words} ${typeof diffWordsLabel === "string" ? diffWordsLabel : "words"}</div>
      ${bestMarkup}
    `;
    card.addEventListener("click", () => selectDiff(difficulty));
    grid.appendChild(card);
  });

  syncShellLaunchLayout();
}

function selectDiff(difficulty: Difficulty) {
  currentDiff = difficulty;
  renderDiffGrid();
  getRequiredElement<HTMLButtonElement>("startBtn").classList.add("ready");
}

function formatSessionDate(dateKey: string) {
  if (!dateKey) return "";
  return new Intl.DateTimeFormat(currentLang === "fr" ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateKey}T12:00:00`));
}

function setElementText(id: string, value: string) {
  const element = document.getElementById(id);
  if (element instanceof HTMLElement) element.textContent = value;
}

function setTitleCopyText(value: string) {
  const copy = document.getElementById("quizTitleCopy");
  const text = document.getElementById("quizTitleCopyText");
  const score = document.getElementById("quizTitleCopyScore");
  const returnLine = document.getElementById("quizTitleCopyReturn");
  const shareRow = document.getElementById("quizTitleShareRow");

  copy?.classList.remove("is-completed");
  if (text instanceof HTMLElement) {
    text.hidden = false;
    text.textContent = value;
  }
  if (score instanceof HTMLElement) {
    score.hidden = true;
    score.textContent = "";
  }
  if (returnLine instanceof HTMLElement) {
    returnLine.hidden = true;
    returnLine.textContent = "";
  }
  if (shareRow instanceof HTMLElement) hideElement(shareRow, "flex");
}

function setCompletedDailyTitleCopy(scoreLine: string, returnText: string) {
  const copy = document.getElementById("quizTitleCopy");
  const text = document.getElementById("quizTitleCopyText");
  const score = document.getElementById("quizTitleCopyScore");
  const returnLine = document.getElementById("quizTitleCopyReturn");
  const shareRow = document.getElementById("quizTitleShareRow");

  copy?.classList.add("is-completed");
  if (text instanceof HTMLElement) {
    text.hidden = true;
    text.textContent = "";
  }
  if (score instanceof HTMLElement) {
    score.hidden = false;
    score.textContent = scoreLine;
  }
  if (returnLine instanceof HTMLElement) {
    returnLine.hidden = false;
    returnLine.textContent = returnText;
  }
  if (shareRow instanceof HTMLElement) showElement(shareRow, "flex");
}

function primeCompletedDailyShareState(
  record: NonNullable<ReturnType<typeof getCompletedDailyRunRecord>>,
) {
  state = {
    ...state,
    questions: Array.from({ length: record.total }, (_, index) => ({
      id: record.wordIds[index] || `completed-daily-${index + 1}`,
    })) as QuizQuestion[],
    score: record.bestScore,
    correct: record.correct,
    bestStreak: record.bestStreak,
  };
}

function formatSingleRunHeadline(formattedDate: string, isArchiveMode: boolean) {
  if (isArchiveMode) return formattedDate;
  return currentLang === "fr" ? `Quotidien · ${formattedDate}` : `Daily · ${formattedDate}`;
}

function formatSingleRunPreCopy(isArchiveMode: boolean) {
  const key = isArchiveMode ? "quiz_pre_copy_archive" : "quiz_pre_copy_daily";
  const fallback =
    currentLang === "fr"
      ? isArchiveMode
        ? "10 questions · rejoue ce quotidien"
        : "10 questions · renouvelée chaque jour"
      : isArchiveMode
        ? "10 questions · replay this daily run"
        : "10 questions · refreshed every day";
  return getTranslatedText(key, fallback);
}

function renderSingleRunTitleScreen() {
  if (!IS_SINGLE_RUN_MODE) return;

  const formattedDate = formatSessionDate(sessionDateKey);
  const isArchiveMode = MANABUPLAY_MODE === "archives";
  const completedDaily = getCompletedDailyRunRecord();

  if (completedDaily) {
    primeCompletedDailyShareState(completedDaily);
    setElementText("quizTitleHeadline", currentLang === "fr" ? "Quotidien terminé" : "Daily done");
    setCompletedDailyTitleCopy(
      currentLang === "fr"
        ? `Score max : ${completedDaily.bestScore} pts`
        : `Best score: ${completedDaily.bestScore} pts`,
      currentLang === "fr"
        ? "Reviens demain pour une nouvelle run."
        : "Come back tomorrow for a new run.",
    );
    syncDailyLaunchControls();
    return;
  }

  setElementText("quizTitleHeadline", formatSingleRunHeadline(formattedDate, isArchiveMode));
  setTitleCopyText(formatSingleRunPreCopy(isArchiveMode));
  syncDailyLaunchControls();
}

function resetQuizToTitleScreen() {
  showElement(getRequiredElement<HTMLElement>("diffArea"), "block");
  hideElement(getRequiredElement<HTMLElement>("progressRow"));
  hideElement(getRequiredElement<HTMLElement>("hudRow"));
  hideElement(getRequiredElement<HTMLElement>("quizArea"));
  hideElement(getRequiredElement<HTMLElement>("resultsArea"), "block");
  renderSingleRunTitleScreen();
  syncShellLaunchLayout();
}

function selectArchiveDate(dateKey: string) {
  if (MANABUPLAY_MODE !== "archives" || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return;
  if (dateKey === sessionDateKey) return;

  sessionDateKey = dateKey;
  quizData = buildQuizDataForSessionDate(sessionDateKey);
  currentDiff = DIFFICULTIES[0] ?? null;
  state = {
    questions: [],
    currentIndex: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    answered: false,
    correct: 0,
  };
  resetQuizToTitleScreen();
  updateLocalizedLinks();
}

function setQuizHash() {
  if (window.location.hash === "#quiz") return;
  window.history.pushState(null, "", `${window.location.pathname}${window.location.search}#quiz`);
}

function scrollQuizSectionIntoView() {
  const modeMain = document.querySelector(".public-mode-main");
  if (modeMain instanceof HTMLElement && window.matchMedia("(min-width: 761px)").matches) {
    return;
  }

  const quizSection = document.getElementById("quiz");
  const quizShell = document.querySelector<HTMLElement>(".quiz-shell");
  const target = quizSection || quizShell;

  if (!(target instanceof HTMLElement)) return;

  const nav = document.querySelector<HTMLElement>("nav");
  const navHeight = nav?.getBoundingClientRect().height ?? 72;
  const topOffset = navHeight + 24;
  const targetTop = target.getBoundingClientRect().top + window.scrollY - topOffset;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  window.scrollTo({
    top: Math.max(0, targetTop),
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
}

function animateReveal(node: HTMLElement | null) {
  if (!node) return;
  node.classList.remove("hint-revealed");
  void node.offsetWidth;
  node.classList.add("hint-revealed");
}

function getTranslatedText(key: string, fallback: string) {
  const value = t(key);
  return typeof value === "string" ? value : fallback;
}

function getHintChipElements() {
  return {
    chips: document.getElementById("hintChips"),
    chip1: document.getElementById("hintChip1"),
    chip2: document.getElementById("hintChip2"),
    reveal1: document.getElementById("hintReveal1"),
    reveal2: document.getElementById("hintReveal2"),
    content1: document.getElementById("hintContent"),
    content2: document.getElementById("hint2Content"),
  };
}

function hideHintReveal(reveal: HTMLElement | null, content: HTMLElement | null) {
  if (reveal instanceof HTMLElement) hideElement(reveal, "grid");
  if (content instanceof HTMLElement) {
    content.textContent = "";
    content.classList.remove("hint-revealed");
  }
}

function showHintReveal(reveal: HTMLElement | null, content: HTMLElement | null, text: string) {
  if (!(content instanceof HTMLElement) || !(reveal instanceof HTMLElement)) return;
  content.textContent = text;
  showElement(reveal, "grid");
  animateReveal(content);
}

function syncHintChipStates(primaryHint: string, secondaryHint: string) {
  const { chip1, chip2 } = getHintChipElements();

  if (chip1 instanceof HTMLButtonElement && primaryHint) {
    chip1.classList.toggle("is-revealed", hintStage >= 1);
    chip1.setAttribute("aria-pressed", hintStage >= 1 ? "true" : "false");
    chip1.disabled = hintStage >= 1;
  }

  if (chip2 instanceof HTMLButtonElement && secondaryHint) {
    const unlocked = hintStage >= 1;
    chip2.classList.toggle("is-locked", !unlocked);
    chip2.disabled = !unlocked || hintStage >= 2;
    chip2.classList.toggle("is-revealed", hintStage >= 2);
    chip2.setAttribute("aria-pressed", hintStage >= 2 ? "true" : "false");
  }
}

function setupHintControls(question: QuizQuestion) {
  const { chips, chip1, chip2, reveal1, reveal2, content1, content2 } = getHintChipElements();
  const primaryHint = getLocalizedField(question.hint);
  const secondaryHint = getLocalizedField(question.hint2);
  hintStage = 0;

  hideHintReveal(reveal1, content1);
  hideHintReveal(reveal2, content2);

  if (!primaryHint && !secondaryHint) {
    if (chips instanceof HTMLElement) hideElement(chips, "flex");
    return;
  }

  if (chips instanceof HTMLElement) showElement(chips, "flex");

  if (chip1 instanceof HTMLButtonElement) {
    if (primaryHint) {
      showElement(chip1, "inline-flex");
      chip1.classList.remove("is-revealed", "is-locked");
      chip1.disabled = false;
      chip1.setAttribute("aria-pressed", "false");
    } else {
      hideElement(chip1, "inline-flex");
    }
  }

  if (chip2 instanceof HTMLButtonElement) {
    if (secondaryHint) {
      showElement(chip2, "inline-flex");
      chip2.classList.add("is-locked");
      chip2.classList.remove("is-revealed");
      chip2.disabled = true;
      chip2.setAttribute("aria-pressed", "false");
    } else {
      hideElement(chip2, "inline-flex");
    }
  }

  syncHintChipStates(primaryHint, secondaryHint);
}

function renderExplanation(text: string, reveal = false) {
  const explanationBox = document.getElementById("explanationBox");
  const explanationContent = document.getElementById("explanationContent");
  if (!(explanationBox instanceof HTMLElement) || !(explanationContent instanceof HTMLElement))
    return;

  if (!text) {
    hideElement(explanationBox);
    explanationContent.textContent = "";
    return;
  }

  explanationContent.textContent = text;
  showElement(explanationBox, "grid");
  if (reveal) animateReveal(explanationBox);
  syncShellLaunchLayout();
}

function resetExplanation() {
  const explanationBox = document.getElementById("explanationBox");
  const explanationContent = document.getElementById("explanationContent");
  if (explanationBox instanceof HTMLElement) hideElement(explanationBox, "grid");
  if (explanationContent instanceof HTMLElement) explanationContent.textContent = "";
  syncShellLaunchLayout();
}

function resetHintDisclosure() {
  const { chips, reveal1, reveal2, content1, content2 } = getHintChipElements();

  if (chips instanceof HTMLElement) hideElement(chips, "flex");
  hideHintReveal(reveal1, content1);
  hideHintReveal(reveal2, content2);
  hintStage = 0;
}

function animateScoreCounter(element: HTMLElement, target: number) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    element.textContent = `${target} pts`;
    return;
  }

  const durationMs = 900;
  const startTime = performance.now();
  element.classList.add("is-rolling");

  function tick(now: number) {
    const progress = Math.min((now - startTime) / durationMs, 1);
    const easedProgress = 1 - (1 - progress) ** 3;
    const value = Math.round(target * easedProgress);
    element.textContent = `${value} pts`;

    if (progress < 1) {
      window.requestAnimationFrame(tick);
      return;
    }

    element.textContent = `${target} pts`;
    element.classList.remove("is-rolling");
    element.classList.add("is-settled");
  }

  window.requestAnimationFrame(tick);
}

function revealHint(trigger?: HTMLElement) {
  if (state.answered) return;

  const question = state.questions[state.currentIndex];
  if (!question) return;

  const hintPrimary = getLocalizedField(question.hint);
  const hintSecondary = getLocalizedField(question.hint2);
  const targetStage = trigger?.dataset.hintStage === "2" ? 2 : 1;
  const { reveal1, reveal2, content1, content2 } = getHintChipElements();

  if (targetStage === 1) {
    if (hintStage > 0 || !hintPrimary) return;
    showHintReveal(reveal1, content1, hintPrimary);
    hintStage = 1;
    syncHintChipStates(hintPrimary, hintSecondary);
    syncShellLaunchLayout();
    return;
  }

  if (hintStage < 1 || hintStage >= 2 || !hintSecondary) return;
  showHintReveal(reveal2, content2, hintSecondary);
  hintStage = 2;
  syncHintChipStates(hintPrimary, hintSecondary);
  syncShellLaunchLayout();
}

function renderQuestion() {
  const question = state.questions[state.currentIndex];
  const total = state.questions.length;

  const progressBar = getRequiredElement<HTMLProgressElement>("progressBar");
  progressBar.max = total;
  progressBar.value = state.currentIndex;
  getRequiredElement<HTMLElement>("progressText").textContent = `${state.currentIndex}/${total}`;
  getRequiredElement<HTMLElement>("scoreDisplay").textContent = String(state.score);
  getRequiredElement<HTMLElement>("streakDisplay").textContent =
    state.streak >= 2 ? `🔥 x${state.streak}` : "";

  const level = state.score < 30 ? "I" : state.score < 80 ? "II" : state.score < 180 ? "III" : "IV";
  getRequiredElement<HTMLElement>("levelDisplay").textContent = level;
  getRequiredElement<HTMLElement>("wordRomaji").textContent =
    question.romaji || question.kana || question.word;
  getRequiredElement<HTMLElement>("wordKana").textContent = question.kana;
  getRequiredElement<HTMLElement>("wordDisplay").textContent = question.word;

  setupHintControls(question);
  resetExplanation();

  const answersGrid = getRequiredElement<HTMLElement>("answersGrid");
  answersGrid.innerHTML = "";
  question.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.className = ANSWER_BUTTON_CLASS;
    button.innerHTML = `<span class="${ANSWER_KEY_CLASS}">${index + 1}</span><span class="${ANSWER_COPY_CLASS}">${answer}</span>`;
    button.addEventListener("click", () => handleAnswer(button, answer, question.correctText));
    answersGrid.appendChild(button);
  });

  const feedback = getRequiredElement<HTMLElement>("feedback");
  hideElement(feedback);
  feedback.classList.remove("is-correct", "is-wrong");
  feedback.textContent = "";
  const nextButton = getRequiredElement<HTMLElement>("nextBtn");
  nextButton.classList.add("opacity-0", "pointer-events-none");
  state.answered = false;
  syncShellLaunchLayout();
}

function handleAnswer(button: HTMLButtonElement, chosen: string, correct: string) {
  if (state.answered) return;
  state.answered = true;

  document.querySelectorAll<HTMLButtonElement>(".answer-btn").forEach((answerButton) => {
    answerButton.disabled = true;
  });

  const hintsUsed = hintStage;
  resetHintDisclosure();
  const question = state.questions[state.currentIndex];
  renderExplanation(getLocalizedField(question?.explanation), true);

  const isCorrect = chosen === correct;
  const feedback = getRequiredElement<HTMLElement>("feedback");
  showElement(feedback, "block");
  feedback.classList.remove("is-correct", "is-wrong");

  if (isCorrect) {
    button.classList.add("correct");
    state.streak += 1;
    state.correct += 1;
    if (state.streak > state.bestStreak) state.bestStreak = state.streak;
    const points = getHintAdjustedQuestionPoints(hintsUsed);
    state.score += points;
    feedback.classList.add("is-correct");
    feedback.textContent =
      state.streak >= 2 ? formatComboFeedback(state.streak, points) : formatCorrectFeedback(points);
  } else {
    button.classList.add("wrong");
    state.streak = 0;
    document.querySelectorAll<HTMLButtonElement>(".answer-btn").forEach((answerButton) => {
      if (answerButton.querySelector(".answer-copy")?.textContent === correct) {
        answerButton.classList.add("correct");
      }
    });
    feedback.classList.add("is-wrong");
    const shortAnswer =
      correct.split(" ").slice(0, 7).join(" ") + (correct.split(" ").length > 7 ? "…" : "");
    feedback.textContent = formatWrongFeedback(shortAnswer);
  }

  getRequiredElement<HTMLElement>("scoreDisplay").textContent = String(state.score);
  getRequiredElement<HTMLElement>("streakDisplay").textContent =
    state.streak >= 2 ? `🔥 x${state.streak}` : "";

  const nextButton = getRequiredElement<HTMLElement>("nextBtn");
  nextButton.classList.remove("opacity-0", "pointer-events-none");
  const label =
    state.currentIndex >= state.questions.length - 1 ? t("see_results") : t("next_word");
  nextButton.textContent = typeof label === "string" ? label : "";
  syncShellLaunchLayout();
}

function showResults() {
  hideElement(getRequiredElement<HTMLElement>("progressRow"));
  hideElement(getRequiredElement<HTMLElement>("hudRow"));
  hideElement(getRequiredElement<HTMLElement>("quizArea"));
  showElement(getRequiredElement<HTMLElement>("resultsArea"), "block");

  const total = state.questions.length;
  const baseScore = state.score;
  const comboMultiplier = getComboMultiplier(state.bestStreak);
  const finalScore = Math.round(baseScore * comboMultiplier);
  const pct = Math.round((finalScore / getMaxFinalScore(total)) * 100);
  const results = getResults();
  const tier = results.find((result) => pct >= result.min) || results[results.length - 1];
  state.score = finalScore;

  getRequiredElement<HTMLElement>("finalEmoji").textContent = tier?.emoji || "🏆";
  getRequiredElement<HTMLElement>("finalTitle").textContent = tier?.title || "";
  getRequiredElement<HTMLElement>("finalMsg").textContent = tier?.msg || "";
  animateScoreCounter(getRequiredElement<HTMLElement>("finalScore"), finalScore);
  getRequiredElement<HTMLElement>("finalBaseScore").textContent = `${baseScore} pts`;
  getRequiredElement<HTMLElement>("finalBaseScoreLabel").textContent =
    currentLang === "fr" ? "Points" : "Points";
  getRequiredElement<HTMLElement>("finalComboMultiplier").textContent =
    formatComboMultiplier(comboMultiplier);
  getRequiredElement<HTMLElement>("finalComboLabel").textContent =
    currentLang === "fr" ? `Série x${state.bestStreak}` : `Streak x${state.bestStreak}`;
  getRequiredElement<HTMLElement>("finalCorrect").textContent = `${state.correct}/${total}`;
  getRequiredElement<HTMLElement>("finalPercent").textContent = `${pct}%`;
  getRequiredElement<HTMLElement>("finalStreak").textContent = String(state.bestStreak);
  const progressBar = getRequiredElement<HTMLProgressElement>("progressBar");
  progressBar.max = total;
  progressBar.value = total;
  getRequiredElement<HTMLElement>("progressText").textContent = `${total}/${total}`;

  if (MANABUPLAY_MODE === "daily") {
    saveDailyRunCompletion({
      storage: LS,
      dateKey: sessionDateKey,
      score: state.score,
      correct: state.correct,
      total,
      bestStreak: state.bestStreak,
      questions: state.questions,
    });
    syncDailyLaunchControls();
  } else if (MANABUPLAY_MODE === "archives") {
    saveArchiveRunCompletion({
      storage: LS,
      dateKey: sessionDateKey,
      score: state.score,
      correct: state.correct,
      total,
      bestStreak: state.bestStreak,
      questions: state.questions,
    });
  }
  syncResultReplayControls();

  if ((MANABUPLAY_MODE === "arcade" || MANABUPLAY_MODE === "practice") && currentDiff) {
    savePracticeSession({
      storage: LS,
      historyKey: PRACTICE_HISTORY_KEY,
      historyLimit: PRACTICE_HISTORY_LIMIT,
      diffId: currentDiff.id,
      questions: state.questions,
    });
  }

  const badge = getRequiredElement<HTMLElement>("newRecordBadge");
  const bestMessage = getRequiredElement<HTMLElement>("bestScoreMsg");
  const shareRow = document.getElementById("shareRow");
  const isArchiveMode = MANABUPLAY_MODE === "archives";

  if (isArchiveMode) {
    hideElement(badge, "block");
    hideElement(bestMessage, "block");
    if (shareRow instanceof HTMLElement) hideElement(shareRow, "block");
  } else if (currentDiff) {
    const isNewRecord = LS.setBest(currentDiff.id, state.score);
    if (isNewRecord) {
      showElement(badge, "block");
    } else {
      hideElement(badge, "block");
    }
    showElement(bestMessage, "block");
    const currentBest = LS.getBest(currentDiff.id);
    const diffLabelValue = t(`diff_${currentDiff.id}`);
    const diffLabel = typeof diffLabelValue === "string" ? diffLabelValue : currentDiff.id;
    bestMessage.innerHTML = formatBestScoreMessage(currentBest, diffLabel);
    if (shareRow instanceof HTMLElement) showElement(shareRow, "block");
  }

  renderDiffGrid();
  syncShellLaunchLayout();
}

function launchQuiz() {
  if (!currentDiff) return;
  if (isDailyRunLocked()) {
    renderSingleRunTitleScreen();
    scrollQuizSectionIntoView();
    return;
  }

  const quizShell = document.querySelector<HTMLElement>(".quiz-shell");
  quizShell?.classList.add("is-launching");

  state = {
    questions: buildQuestionsForCurrentDiff(currentDiff.words),
    currentIndex: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    answered: false,
    correct: 0,
  };

  hideElement(getRequiredElement<HTMLElement>("diffArea"));
  showElement(getRequiredElement<HTMLElement>("progressRow"));
  showElement(getRequiredElement<HTMLElement>("hudRow"));
  showElement(getRequiredElement<HTMLElement>("quizArea"));
  hideElement(getRequiredElement<HTMLElement>("resultsArea"), "block");
  syncShellLaunchLayout();
  renderQuestion();
  requestAnimationFrame(() => {
    scrollQuizSectionIntoView();
    window.setTimeout(() => quizShell?.classList.remove("is-launching"), 420);
  });
}

function goToDiffPicker() {
  showElement(getRequiredElement<HTMLElement>("diffArea"), "block");
  hideElement(getRequiredElement<HTMLElement>("progressRow"));
  hideElement(getRequiredElement<HTMLElement>("hudRow"));
  hideElement(getRequiredElement<HTMLElement>("quizArea"));
  hideElement(getRequiredElement<HTMLElement>("resultsArea"), "block");
  renderDiffGrid();
}

function replayDifficulty() {
  launchQuiz();
}

function nextQuestion() {
  state.currentIndex += 1;
  if (state.currentIndex >= state.questions.length) {
    showResults();
  } else {
    renderQuestion();
  }
}

const waitlistController = createWaitlistController({
  storage: LS,
  currentLangRef: () => currentLang,
  t,
  waitlistStorageKey: WAITLIST_STORAGE_KEY,
  waitlistFormName: WAITLIST_FORM_NAME,
  successButtonDelay: WAITLIST_SUCCESS_BUTTON_DELAY,
  successMessageDelay: WAITLIST_SUCCESS_MESSAGE_DELAY,
});

const shareController = createShareController({
  getState: () => state,
  getCurrentDiff: () => currentDiff,
  getCurrentLang: () => currentLang,
  getResults,
  t,
});

const actionHandlers: Record<QuizAction, QuizActionHandler> = {
  launchQuiz: () => launchQuiz(),
  revealHint: (element) => revealHint(element),
  nextQuestion: () => nextQuestion(),
  replayDifficulty: () => replayDifficulty(),
  goToDiffPicker: () => goToDiffPicker(),
  shareOnX: () => shareController.shareOnX(),
  copyShareLink: (element) => shareController.copyShareLink(element),
};

function bindQuizActions() {
  document.querySelectorAll<HTMLElement>("[data-quiz-action]").forEach((element) => {
    element.addEventListener("click", (event) => {
      const action = element.dataset.quizAction as QuizAction | undefined;
      if (!action) return;
      if (action === "launchQuiz" && element instanceof HTMLAnchorElement) {
        event.preventDefault();
        setQuizHash();
      }
      actionHandlers[action]?.(element);
    });
  });
}

window.addEventListener("manabuplay:archive-date-selected", (event) => {
  if (!(event instanceof CustomEvent)) return;
  const dateKey = event.detail?.dateKey;
  if (typeof dateKey === "string") selectArchiveDate(dateKey);
});

applyLang();
renderDiffGrid();
createRevealObserver().observeAll(".reveal");
bindQuizActions();

const waitlistForm = document.querySelector('form[name="manabuplay-waitlist"]');
if (waitlistForm instanceof HTMLFormElement) {
  waitlistForm.addEventListener("submit", waitlistController.handleEmailSubmit);
}
