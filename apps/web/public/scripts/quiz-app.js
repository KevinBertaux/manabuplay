import {
  buildDailyQuizData,
  buildQuestions,
  getSessionDateKey,
  savePracticeSession,
} from "/scripts/quiz-app/session.js";
import {
  createRevealObserver,
  createShareController,
  createWaitlistController,
} from "/scripts/quiz-app/engagement.js";

const MANABUPLAY_BOOT = window.__MANABUPLAY_DATA__;
if (!MANABUPLAY_BOOT) {
  throw new Error("ManabuPlay boot data is missing.");
}

const MANABUPLAY_MODE = MANABUPLAY_BOOT.mode || window.__MANABUPLAY_MODE__ || "legacy";
const DIFFICULTIES = MANABUPLAY_BOOT.difficulties;
const WAITLIST_STORAGE_KEY = "waitlist_submissions";
const WAITLIST_FORM_NAME = "manabuplay-waitlist";
const WAITLIST_SUCCESS_BUTTON_DELAY = 2800;
const WAITLIST_SUCCESS_MESSAGE_DELAY = 4000;
const SUPPORTED_LANGS = ["en", "fr"];
const LOCALIZED_ROUTES = ["daily", "practice", "archives"];
const PRACTICE_HISTORY_KEY = "practice_sessions";
const PRACTICE_HISTORY_LIMIT = 8;
const LANG = MANABUPLAY_BOOT.lang;

let currentDiff = null;
let hintStage = 0;
let state = {
  questions: [],
  currentIndex: 0,
  score: 0,
  streak: 0,
  bestStreak: 0,
  answered: false,
  correct: 0,
};

const LS = {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(`mp_${key}`));
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(`mp_${key}`, JSON.stringify(value));
    } catch {}
  },
  getBest(diffId) {
    return LS.get(`best_${diffId}`) || 0;
  },
  setBest(diffId, score) {
    const previousBest = LS.getBest(diffId);
    if (score > previousBest) {
      LS.set(`best_${diffId}`, score);
      return true;
    }
    return false;
  },
  getLang() {
    return LS.get("lang") || "en";
  },
  setLang(lang) {
    LS.set("lang", lang);
  },
};

const pageLocale = SUPPORTED_LANGS.includes(window.__MANABUPLAY_LOCALE__)
  ? window.__MANABUPLAY_LOCALE__
  : null;
let currentLang = pageLocale || (SUPPORTED_LANGS.includes(LS.getLang()) ? LS.getLang() : "en");
const t = (key) => (LANG[currentLang]?.[key] ?? LANG.en?.[key]) || "";

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

function localizedPath(lang, route) {
  return `/${lang}/${route ? `${route}/` : ""}`;
}

function getCurrentLocalizedRoute() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  if (!SUPPORTED_LANGS.includes(parts[0])) return "";
  return LOCALIZED_ROUTES.includes(parts[1]) ? parts[1] : "";
}

function getLocalizedField(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[currentLang] || value.en || "";
}

function updateLocalizedLinks() {
  const route = getCurrentLocalizedRoute();
  const currentSearch = window.location.search;
  document.querySelectorAll("[data-public-route]").forEach((link) => {
    const targetRoute = link.dataset.publicRoute;
    if (LOCALIZED_ROUTES.includes(targetRoute)) {
      link.setAttribute("href", localizedPath(currentLang, targetRoute));
    }
  });
  document.querySelectorAll("[data-locale-home]").forEach((link) => {
    const targetLang = link.dataset.localeHome;
    if (SUPPORTED_LANGS.includes(targetLang)) {
      const searchSuffix = route === "archives" ? currentSearch : "";
      link.setAttribute("href", localizedPath(targetLang, route) + searchSuffix);
    }
  });
}

function buildQuestionsForCurrentDiff(wordCount) {
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
  document.getElementById("htmlRoot").lang = currentLang;

  const seoTitle = t("seo_title");
  if (typeof seoTitle === "string" && seoTitle) {
    document.title = seoTitle;
  }

  const seoDescription = t("seo_description");
  if (typeof seoDescription === "string" && seoDescription) {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", seoDescription);
    }
  }

  const ogDescription = t("og_description");
  if (typeof ogDescription === "string" && ogDescription) {
    const ogMetaDescription = document.querySelector('meta[property="og:description"]');
    if (ogMetaDescription) {
      ogMetaDescription.setAttribute("content", ogDescription);
    }
  }

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = t(element.dataset.i18n);
    if (typeof value === "string") element.innerHTML = value;
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPh);
  });
  document.getElementById("btnEN")?.classList.toggle("active", currentLang === "en");
  document.getElementById("btnFR")?.classList.toggle("active", currentLang === "fr");
  updateLocalizedLinks();

  const copyButton = document.getElementById("shareBtnCopy");
  const copyLabel = document.getElementById("copyBtnLabel");
  if (copyButton && copyLabel && !copyButton.classList.contains("copied")) {
    copyLabel.textContent = t("result_share_copy");
  }

  renderDiffGrid();

  const nextButton = document.getElementById("nextBtn");
  if (nextButton && !nextButton.classList.contains("opacity-0")) {
    nextButton.textContent =
      state.currentIndex >= state.questions.length - 1 ? t("see_results") : t("next_word");
  }
}

function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang) || lang === currentLang) return;

  const currentRoute = getCurrentLocalizedRoute();
  const isLocalizedPage = SUPPORTED_LANGS.includes(
    window.location.pathname.split("/").filter(Boolean)[0],
  );

  if (isLocalizedPage) {
    LS.setLang(lang);
    window.location.href =
      localizedPath(lang, currentRoute) + window.location.search + window.location.hash;
    return;
  }

  currentLang = lang;
  LS.setLang(lang);
  const currentIndex = state.currentIndex;
  const score = state.score;
  const streak = state.streak;
  const bestStreak = state.bestStreak;

  if (currentDiff) {
    state.questions = buildQuestionsForCurrentDiff(currentDiff.words);
    state.currentIndex = Math.min(currentIndex, state.questions.length - 1);
    state.score = score;
    state.streak = streak;
    state.bestStreak = bestStreak;
    state.answered = false;
  }

  applyLang();
  if (document.getElementById("quizArea").style.display !== "none") {
    renderQuestion();
  }
}

function renderDiffGrid() {
  const grid = document.getElementById("diffGrid");
  if (!grid) return;

  grid.innerHTML = "";
  DIFFICULTIES.forEach((difficulty) => {
    const best = LS.getBest(difficulty.id);
    const bestLabel =
      best > 0
        ? `${t("diff_best")} <span style="color:${difficulty.color};font-weight:700;">${best} pts</span>`
        : `<span style="color:rgba(255,255,255,.3);">${t("diff_no_best")}</span>`;
    const bestMarkup =
      MANABUPLAY_MODE === "archives"
        ? ""
        : `<div class="diff-best mt-1" style="color:rgba(255,255,255,.5);">${bestLabel}</div>`;
    const card = document.createElement("div");
    card.className = `diff-card ${difficulty.cls}${currentDiff?.id === difficulty.id ? " selected" : ""}`;
    card.innerHTML = `
      <span class="diff-icon">${difficulty.icon}</span>
      <div class="diff-name" style="color:${difficulty.color};">${t(`diff_${difficulty.id}`)}</div>
      <div class="diff-count" style="color:rgba(255,255,255,.6);">${difficulty.words} ${t("diff_words")}</div>
      ${bestMarkup}
    `;
    card.onclick = () => selectDiff(difficulty);
    grid.appendChild(card);
  });
}

function selectDiff(difficulty) {
  currentDiff = difficulty;
  renderDiffGrid();
  document.getElementById("startBtn")?.classList.add("ready");
}

function animateReveal(node) {
  if (!node) return;
  node.classList.remove("hint-revealed");
  void node.offsetWidth;
  node.classList.add("hint-revealed");
}

function setHintButtonLabel(key) {
  const hintButton = document.getElementById("hintBtn");
  if (!hintButton) return;
  const label = hintButton.querySelector("[data-i18n]");
  if (label) label.textContent = t(key);
}

function hideHintButton() {
  const hintButton = document.getElementById("hintBtn");
  if (hintButton) hintButton.style.display = "none";
}

function renderExplanation(text, reveal = false) {
  const explanationBox = document.getElementById("explanationBox");
  const explanationContent = document.getElementById("explanationContent");
  if (!explanationBox || !explanationContent) return;

  if (!text) {
    explanationBox.style.display = "none";
    explanationContent.textContent = "";
    return;
  }

  explanationContent.textContent = text;
  explanationBox.style.display = "grid";
  if (reveal) animateReveal(explanationBox);
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

  if (!zone || !primaryContent) return;

  zone.style.display = "grid";

  if (hintStage === 0 || forceAll) {
    primaryContent.textContent = hintPrimary;
    animateReveal(primaryContent);
    hintStage = 1;
  }

  if ((forceAll || previousStage >= 1) && hintSecondary && secondaryRow && secondaryContent) {
    secondaryRow.style.display = "grid";
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

  document.getElementById("progressBar").style.width = `${(state.currentIndex / total) * 100}%`;
  document.getElementById("progressText").textContent = `${state.currentIndex}/${total}`;
  document.getElementById("scoreDisplay").textContent = state.score;
  document.getElementById("streakDisplay").textContent =
    state.streak >= 2 ? `🔥 x${state.streak}` : "";

  const level = state.score < 30 ? "I" : state.score < 80 ? "II" : state.score < 180 ? "III" : "IV";
  document.getElementById("levelDisplay").textContent = level;
  document.getElementById("wordKana").textContent = question.kana;
  document.getElementById("wordDisplay").textContent = question.word;
  document.getElementById("wordCategory").textContent =
    question.cat[currentLang] || question.cat.en;

  const hintButton = document.getElementById("hintBtn");
  const hintText = document.getElementById("hintText");
  const hintContent = document.getElementById("hintContent");
  const hintTextSecondary = document.getElementById("hintTextSecondary");
  const hint2Content = document.getElementById("hint2Content");
  const primaryHint = getLocalizedField(question.hint);
  const secondaryHint = getLocalizedField(question.hint2);
  hintStage = 0;

  if (hintButton) {
    hintButton.style.display = primaryHint || secondaryHint ? "inline-flex" : "none";
    setHintButtonLabel("hint_btn");
  }
  if (hintText) hintText.style.display = "none";
  if (hintContent) {
    hintContent.textContent = primaryHint;
    hintContent.classList.remove("hint-revealed");
  }
  if (hintTextSecondary) {
    hintTextSecondary.style.display = "none";
    hintTextSecondary.classList.remove("hint-revealed");
  }
  if (hint2Content) {
    hint2Content.textContent = secondaryHint;
    hint2Content.classList.remove("hint-revealed");
  }
  renderExplanation(getLocalizedField(question.explanation), false);

  const answersGrid = document.getElementById("answersGrid");
  answersGrid.innerHTML = "";
  question.answers.forEach((answer) => {
    const button = document.createElement("button");
    button.className = "answer-btn";
    button.innerHTML = `<span>${answer}</span>`;
    button.onclick = () => handleAnswer(button, answer, question.correctText);
    answersGrid.appendChild(button);
  });

  const feedback = document.getElementById("feedback");
  feedback.style.display = "none";
  feedback.textContent = "";
  const nextButton = document.getElementById("nextBtn");
  nextButton.classList.add("opacity-0", "pointer-events-none");
  state.answered = false;
}

function spawnParticles(button, color) {
  const rect = button.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let index = 0; index < 8; index += 1) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.cssText = `left:${centerX}px;top:${centerY}px;background:${color};--tx:${(Math.random() - 0.5) * 120}px;--ty:${(Math.random() - 0.8) * 100}px;`;
    document.body.appendChild(particle);
    particle.addEventListener("animationend", () => particle.remove());
  }
}

function handleAnswer(button, chosen, correct) {
  if (state.answered) return;
  state.answered = true;

  document.querySelectorAll(".answer-btn").forEach((answerButton) => {
    answerButton.disabled = true;
  });

  revealHint(true);
  const question = state.questions[state.currentIndex];
  renderExplanation(getLocalizedField(question?.explanation), true);

  const isCorrect = chosen === correct;
  const feedback = document.getElementById("feedback");
  feedback.style.display = "block";

  if (isCorrect) {
    button.classList.add("correct");
    state.streak += 1;
    state.correct += 1;
    if (state.streak > state.bestStreak) state.bestStreak = state.streak;
    const bonus = state.streak >= 3 ? 15 : state.streak >= 2 ? 12 : 10;
    state.score += bonus;
    feedback.style.color = "var(--green)";
    feedback.textContent =
      state.streak >= 3 ? t("fb_combo")(state.streak, bonus) : t("fb_correct")(bonus);
    spawnParticles(button, "#4ade80");
  } else {
    button.classList.add("wrong");
    state.streak = 0;
    document.querySelectorAll(".answer-btn").forEach((answerButton) => {
      if (answerButton.querySelector("span").textContent === correct) {
        answerButton.classList.add("correct");
      }
    });
    feedback.style.color = "var(--red)";
    const shortAnswer =
      correct.split(" ").slice(0, 7).join(" ") + (correct.split(" ").length > 7 ? "…" : "");
    feedback.textContent = t("fb_wrong")(shortAnswer);
  }

  document.getElementById("scoreDisplay").textContent = state.score;
  document.getElementById("streakDisplay").textContent =
    state.streak >= 2 ? `🔥 x${state.streak}` : "";

  const nextButton = document.getElementById("nextBtn");
  nextButton.classList.remove("opacity-0", "pointer-events-none");
  nextButton.textContent =
    state.currentIndex >= state.questions.length - 1 ? t("see_results") : t("next_word");
}

function showResults() {
  document.getElementById("progressRow").style.display = "none";
  document.getElementById("hudRow").style.display = "none";
  document.getElementById("quizArea").style.display = "none";
  document.getElementById("resultsArea").style.display = "block";

  const total = state.questions.length;
  const pct = Math.round((state.score / (total * 15)) * 100);
  const tier =
    t("results").find((result) => pct >= result.min) || t("results")[t("results").length - 1];

  document.getElementById("finalEmoji").textContent = tier.emoji;
  document.getElementById("finalTitle").textContent = tier.title;
  document.getElementById("finalMsg").textContent = tier.msg;
  document.getElementById("finalScore").textContent = `${state.score} pts`;
  document.getElementById("finalCorrect").textContent = `${state.correct}/${total}`;
  document.getElementById("finalPercent").textContent = `${pct}%`;
  document.getElementById("finalStreak").textContent = state.bestStreak;
  document.getElementById("progressBar").style.width = "100%";
  document.getElementById("progressText").textContent = `${total}/${total}`;

  if (MANABUPLAY_MODE === "practice" && currentDiff) {
    savePracticeSession({
      storage: LS,
      historyKey: PRACTICE_HISTORY_KEY,
      historyLimit: PRACTICE_HISTORY_LIMIT,
      diffId: currentDiff.id,
      questions: state.questions,
    });
  }

  const badge = document.getElementById("newRecordBadge");
  const bestMessage = document.getElementById("bestScoreMsg");
  const shareRow = document.getElementById("shareRow");
  const isArchiveMode = MANABUPLAY_MODE === "archives";

  if (isArchiveMode) {
    badge.style.display = "none";
    bestMessage.style.display = "none";
    if (shareRow) shareRow.style.display = "none";
  } else {
    const isNewRecord = LS.setBest(currentDiff.id, state.score);
    badge.style.display = isNewRecord ? "block" : "none";
    bestMessage.style.display = "block";
    const currentBest = LS.getBest(currentDiff.id);
    const diffLabel = t(`diff_${currentDiff.id}`);
    bestMessage.innerHTML = t("result_best_msg")(currentBest, diffLabel);
    if (shareRow) shareRow.style.display = "block";
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

  document.getElementById("diffArea").style.display = "none";
  document.getElementById("progressRow").style.display = "flex";
  document.getElementById("hudRow").style.display = "flex";
  document.getElementById("quizArea").style.display = "block";
  document.getElementById("resultsArea").style.display = "none";
  renderQuestion();
}

function goToDiffPicker() {
  document.getElementById("diffArea").style.display = "block";
  document.getElementById("progressRow").style.display = "none";
  document.getElementById("hudRow").style.display = "none";
  document.getElementById("quizArea").style.display = "none";
  document.getElementById("resultsArea").style.display = "none";
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
  t,
});

applyLang();
renderDiffGrid();
createRevealObserver().observeAll(".reveal");

const waitlistForm = document.querySelector('form[name="manabuplay-waitlist"]');
if (waitlistForm) {
  waitlistForm.addEventListener("submit", waitlistController.handleEmailSubmit);
}

window.setLang = setLang;
window.launchQuiz = launchQuiz;
window.revealHint = revealHint;
window.nextQuestion = nextQuestion;
window.replayDifficulty = replayDifficulty;
window.goToDiffPicker = goToDiffPicker;
window.shareOnX = shareController.shareOnX;
window.copyShareLink = shareController.copyShareLink;
