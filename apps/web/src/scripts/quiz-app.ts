import {
  buildDailyQuizData,
  buildQuestions,
  getSessionDateKey,
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

const bootData = window.__MANABUPLAY_DATA__ as QuizBootData | undefined;
if (!bootData) {
  throw new Error("ManabuPlay boot data is missing.");
}
const MANABUPLAY_BOOT: QuizBootData = bootData;

const MANABUPLAY_MODE = MANABUPLAY_BOOT.mode || window.__MANABUPLAY_MODE__ || "legacy";
const DIFFICULTIES = MANABUPLAY_BOOT.difficulties;
const WAITLIST_STORAGE_KEY = "waitlist_submissions";
const WAITLIST_FORM_NAME = "manabuplay-waitlist";
const WAITLIST_SUCCESS_BUTTON_DELAY = 2800;
const WAITLIST_SUCCESS_MESSAGE_DELAY = 4000;
const SUPPORTED_LANGS = ["en", "fr"] as const;
const LOCALIZED_ROUTES = ["daily", "practice", "archives"] as const;
const PRACTICE_HISTORY_KEY = "practice_sessions";
const PRACTICE_HISTORY_LIMIT = 8;
const LANG = MANABUPLAY_BOOT.lang;
const ANSWER_BUTTON_CLASS =
  "answer-btn grid min-h-12 w-full grid-cols-[1.55rem_minmax(0,1fr)] items-center gap-2 rounded-lg border border-[rgba(34,211,238,.22)] bg-[linear-gradient(180deg,rgba(18,44,60,.72),rgba(17,18,40,.94))] px-3 py-2 text-left font-body text-[.98rem] font-extrabold leading-snug text-[#eee7ff] transition-[background,border-color,color] duration-150 hover:border-[rgba(34,211,238,.42)] hover:bg-[rgba(34,211,238,.08)] disabled:cursor-not-allowed disabled:opacity-85 sm:min-h-14 sm:grid-cols-[1.75rem_minmax(0,1fr)] sm:text-base";
const ANSWER_KEY_CLASS =
  "answer-key grid h-6 w-6 place-items-center rounded-lg bg-white/[.06] text-[.72rem] font-black text-[#cdbdff] sm:h-7 sm:w-7 sm:text-[.78rem]";
const ANSWER_COPY_CLASS = "answer-copy min-w-0";

let currentDiff: Difficulty | null = null;
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
    ? `Ton record en ${diff} : <strong class="best-score-highlight">${score} pts</strong>`
    : `Your best on ${diff}: <strong class="best-score-highlight">${score} pts</strong>`;
}

function formatCorrectFeedback(points: number): string {
  return currentLang === "fr"
    ? `✓ 正解! (Seikai) — Correct ! +${points} pts`
    : `✓ 正解! (Seikai) — Correct! +${points} pts`;
}

function formatComboFeedback(streak: number, points: number): string {
  return currentLang === "fr"
    ? `🔥 COMBO x${streak} ! +${points} pts — 正解! (Seikai = Correct !)`
    : `🔥 COMBO x${streak}! +${points} pts — 正解! (Seikai = Correct!)`;
}

function formatWrongFeedback(answer: string): string {
  return currentLang === "fr"
    ? `✗ 不正解 (Fuseikai) — La réponse : "${answer}"`
    : `✗ 不正解 (Fuseikai) — The answer: "${answer}"`;
}

const RAW_QUIZ_DATA = MANABUPLAY_BOOT.quizData;
const SESSION_DATE_KEY = getSessionDateKey({
  mode: MANABUPLAY_MODE,
  archiveConfig: MANABUPLAY_BOOT.archive || {},
  search: window.location.search,
});
const QUIZ_DATA =
  MANABUPLAY_MODE === "daily" || MANABUPLAY_MODE === "archives"
    ? buildDailyQuizData({
        pool: RAW_QUIZ_DATA,
        dateKey: SESSION_DATE_KEY,
        dailyConfig: MANABUPLAY_BOOT.daily || {},
      })
    : RAW_QUIZ_DATA;

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
    quizData: QUIZ_DATA,
    rawQuizData: RAW_QUIZ_DATA,
    currentLang,
    currentDiff,
    sessionDateKey: SESSION_DATE_KEY,
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

function renderDiffGrid() {
  const grid = document.getElementById("diffGrid");
  if (!(grid instanceof HTMLElement)) return;

  grid.innerHTML = "";
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
}

function selectDiff(difficulty: Difficulty) {
  currentDiff = difficulty;
  renderDiffGrid();
  getRequiredElement<HTMLButtonElement>("startBtn").classList.add("ready");
}

function animateReveal(node: HTMLElement | null) {
  if (!node) return;
  node.classList.remove("hint-revealed");
  void node.offsetWidth;
  node.classList.add("hint-revealed");
}

function setHintButtonLabel(key: string) {
  const hintButton = document.getElementById("hintBtn");
  if (!(hintButton instanceof HTMLElement)) return;
  const label = hintButton.querySelector<HTMLElement>("[data-i18n]");
  if (!label) return;
  const text = t(key);
  label.textContent = typeof text === "string" ? text : "";
}

function hideHintButton() {
  const hintButton = document.getElementById("hintBtn");
  if (hintButton instanceof HTMLElement) hideElement(hintButton, "inline-flex");
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
}

function resetExplanation() {
  const explanationBox = document.getElementById("explanationBox");
  const explanationContent = document.getElementById("explanationContent");
  if (explanationBox instanceof HTMLElement) hideElement(explanationBox, "grid");
  if (explanationContent instanceof HTMLElement) explanationContent.textContent = "";
}

function resetHintDisclosure() {
  const hintButton = document.getElementById("hintBtn");
  const hintText = document.getElementById("hintText");
  const hintTextSecondary = document.getElementById("hintTextSecondary");

  if (hintButton instanceof HTMLElement) hideElement(hintButton, "inline-flex");
  if (hintText instanceof HTMLElement) hideElement(hintText, "grid");
  if (hintTextSecondary instanceof HTMLElement) hideElement(hintTextSecondary, "grid");
}

function revealHint(forceAll = false) {
  const question = state.questions[state.currentIndex];
  if (!question) return;

  const hintPrimary = getLocalizedField(question.hint);
  const hintSecondary = getLocalizedField(question.hint2);
  const previousStage = hintStage;
  const zone = document.getElementById("hintText");
  const primaryContent = document.getElementById("hintContent");
  const secondaryRow = document.getElementById("hintTextSecondary");
  const secondaryContent = document.getElementById("hint2Content");

  if (!(zone instanceof HTMLElement) || !(primaryContent instanceof HTMLElement)) return;

  showElement(zone, "grid");

  if (hintStage === 0 || forceAll) {
    primaryContent.textContent = hintPrimary;
    animateReveal(primaryContent);
    hintStage = 1;
  }

  if (
    (forceAll || previousStage >= 1) &&
    hintSecondary &&
    secondaryRow instanceof HTMLElement &&
    secondaryContent instanceof HTMLElement
  ) {
    showElement(secondaryRow, "grid");
    secondaryContent.textContent = hintSecondary;
    animateReveal(secondaryRow);
    hintStage = 2;
  }

  if (forceAll || !hintSecondary || hintStage >= 2) {
    hideHintButton();
    return;
  }

  setHintButtonLabel("hint_btn_more");
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
  getRequiredElement<HTMLElement>("wordCategory").textContent =
    question.cat[currentLang] || question.cat.en;

  const hintButton = document.getElementById("hintBtn");
  const hintText = document.getElementById("hintText");
  const hintContent = document.getElementById("hintContent");
  const hintTextSecondary = document.getElementById("hintTextSecondary");
  const hint2Content = document.getElementById("hint2Content");
  const primaryHint = getLocalizedField(question.hint);
  const secondaryHint = getLocalizedField(question.hint2);
  hintStage = 0;

  if (hintButton instanceof HTMLElement) {
    if (primaryHint || secondaryHint) {
      showElement(hintButton, "inline-flex");
    } else {
      hideElement(hintButton, "inline-flex");
    }
    setHintButtonLabel("hint_btn");
  }
  if (hintText instanceof HTMLElement) hideElement(hintText, "grid");
  if (hintContent instanceof HTMLElement) {
    hintContent.textContent = primaryHint;
    hintContent.classList.remove("hint-revealed");
  }
  if (hintTextSecondary instanceof HTMLElement) {
    hideElement(hintTextSecondary, "grid");
    hintTextSecondary.classList.remove("hint-revealed");
  }
  if (hint2Content instanceof HTMLElement) {
    hint2Content.textContent = secondaryHint;
    hint2Content.classList.remove("hint-revealed");
  }
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
}

function handleAnswer(button: HTMLButtonElement, chosen: string, correct: string) {
  if (state.answered) return;
  state.answered = true;

  document.querySelectorAll<HTMLButtonElement>(".answer-btn").forEach((answerButton) => {
    answerButton.disabled = true;
  });

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
    const bonus = state.streak >= 3 ? 15 : state.streak >= 2 ? 12 : 10;
    state.score += bonus;
    feedback.classList.add("is-correct");
    feedback.textContent =
      state.streak >= 3 ? formatComboFeedback(state.streak, bonus) : formatCorrectFeedback(bonus);
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
}

function showResults() {
  hideElement(getRequiredElement<HTMLElement>("progressRow"));
  hideElement(getRequiredElement<HTMLElement>("hudRow"));
  hideElement(getRequiredElement<HTMLElement>("quizArea"));
  showElement(getRequiredElement<HTMLElement>("resultsArea"), "block");

  const total = state.questions.length;
  const pct = Math.round((state.score / (total * 15)) * 100);
  const results = getResults();
  const tier = results.find((result) => pct >= result.min) || results[results.length - 1];

  getRequiredElement<HTMLElement>("finalEmoji").textContent = tier?.emoji || "🏆";
  getRequiredElement<HTMLElement>("finalTitle").textContent = tier?.title || "";
  getRequiredElement<HTMLElement>("finalMsg").textContent = tier?.msg || "";
  getRequiredElement<HTMLElement>("finalScore").textContent = `${state.score} pts`;
  getRequiredElement<HTMLElement>("finalCorrect").textContent = `${state.correct}/${total}`;
  getRequiredElement<HTMLElement>("finalPercent").textContent = `${pct}%`;
  getRequiredElement<HTMLElement>("finalStreak").textContent = String(state.bestStreak);
  const progressBar = getRequiredElement<HTMLProgressElement>("progressBar");
  progressBar.max = total;
  progressBar.value = total;
  getRequiredElement<HTMLElement>("progressText").textContent = `${total}/${total}`;

  if (MANABUPLAY_MODE === "practice" && currentDiff) {
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
}

function launchQuiz() {
  if (!currentDiff) return;

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
  renderQuestion();
  requestAnimationFrame(() => {
    getRequiredElement<HTMLElement>("quizArea").scrollIntoView({
      block: "start",
      behavior: "smooth",
    });
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
  state,
  getCurrentDiff: () => currentDiff,
  getCurrentLang: () => currentLang,
  getResults,
  t,
});

const actionHandlers: Record<QuizAction, () => void> = {
  launchQuiz,
  revealHint: () => revealHint(),
  nextQuestion,
  replayDifficulty,
  goToDiffPicker,
  shareOnX: shareController.shareOnX,
  copyShareLink: shareController.copyShareLink,
};

function bindQuizActions() {
  document.querySelectorAll<HTMLElement>("[data-quiz-action]").forEach((element) => {
    element.addEventListener("click", () => {
      const action = element.dataset.quizAction as QuizAction | undefined;
      if (!action) return;
      actionHandlers[action]?.();
    });
  });
}

applyLang();
renderDiffGrid();
createRevealObserver().observeAll(".reveal");
bindQuizActions();

const waitlistForm = document.querySelector('form[name="manabuplay-waitlist"]');
if (waitlistForm instanceof HTMLFormElement) {
  waitlistForm.addEventListener("submit", waitlistController.handleEmailSubmit);
}
