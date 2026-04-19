export function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getSessionDateKey({ mode, archiveConfig = {}, search = "" }) {
  if (mode !== "archives") {
    return getLocalDateKey();
  }

  const selectedFromQuery = new URLSearchParams(search).get("date");
  const selectedDate = selectedFromQuery || archiveConfig.selectedDate || getLocalDateKey();
  const startDate = archiveConfig.startDate || selectedDate;
  const latestDate = archiveConfig.latestDate || selectedDate;
  const isValidFormat = /^\d{4}-\d{2}-\d{2}$/.test(selectedDate);

  if (isValidFormat && selectedDate >= startDate && selectedDate <= latestDate) {
    return selectedDate;
  }

  return archiveConfig.selectedDate || latestDate || getLocalDateKey();
}

function hashSeed(input) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let result = Math.imul(value ^ (value >>> 15), value | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(items, seedSource) {
  const random = mulberry32(hashSeed(seedSource));
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function buildDailyQuizData({ pool, dateKey, dailyConfig = {} }) {
  const targets = dailyConfig.tierTargets || { 1: 4, 2: 3, 3: 2, 4: 1 };
  const questionCount = dailyConfig.questionCount || 10;
  const selected = [];
  const selectedIds = new Set();

  Object.entries(targets).forEach(([tier, count]) => {
    const tierPool = pool.filter((entry) => String(entry.tier || 1) === tier);
    seededShuffle(tierPool, `${dateKey}:tier:${tier}`)
      .slice(0, count)
      .forEach((entry) => {
        selected.push(entry);
        selectedIds.add(entry.id);
      });
  });

  if (selected.length < questionCount) {
    seededShuffle(pool, `${dateKey}:fill`).forEach((entry) => {
      if (selected.length >= questionCount || selectedIds.has(entry.id)) return;
      selected.push(entry);
      selectedIds.add(entry.id);
    });
  }

  return seededShuffle(selected.slice(0, questionCount), `${dateKey}:order`);
}

export function getPracticeConfig(boot) {
  return boot.practice || { questionCount: 10, cooldownSessions: 2, recipes: {} };
}

function readPracticeSessions(storage, historyKey) {
  const sessions = storage.get(historyKey);
  return Array.isArray(sessions) ? sessions : [];
}

function getPracticeCooldownIds({ storage, historyKey, practiceConfig }) {
  const cooldownSessions = practiceConfig.cooldownSessions || 2;
  const recentSessions = readPracticeSessions(storage, historyKey).slice(0, cooldownSessions);
  return new Set(
    recentSessions.flatMap((session) => (Array.isArray(session.wordIds) ? session.wordIds : [])),
  );
}

export function savePracticeSession({ storage, historyKey, historyLimit, diffId, questions }) {
  const currentSessions = readPracticeSessions(storage, historyKey);
  const session = {
    diffId,
    completedAt: new Date().toISOString(),
    wordIds: questions.map((question) => question.id),
  };
  storage.set(historyKey, [session, ...currentSessions].slice(0, historyLimit));
}

function pickPracticeEntries(pool, desiredCount, seedSource, selectedIds, cooldownIds) {
  const eligiblePool = pool.filter(
    (entry) => !selectedIds.has(entry.id) && !cooldownIds.has(entry.id),
  );
  const fallbackPool = pool.filter((entry) => !selectedIds.has(entry.id));
  const picks = seededShuffle(eligiblePool, `${seedSource}:eligible`).slice(0, desiredCount);

  if (picks.length < desiredCount) {
    seededShuffle(fallbackPool, `${seedSource}:fallback`).forEach((entry) => {
      if (picks.length >= desiredCount) return;
      if (picks.some((pick) => pick.id === entry.id)) return;
      picks.push(entry);
    });
  }

  picks.forEach((entry) => selectedIds.add(entry.id));
  return picks;
}

function buildPracticeSession({ practiceConfig, rawQuizData, currentDiff, storage, historyKey }) {
  if (!currentDiff) return [];

  const tierTargets = currentDiff?.tierTargets || practiceConfig.recipes?.[currentDiff.id] || {};
  const selected = [];
  const selectedIds = new Set();
  const cooldownIds = getPracticeCooldownIds({ storage, historyKey, practiceConfig });

  Object.entries(tierTargets).forEach(([tier, count]) => {
    const tierPool = rawQuizData.filter((entry) => String(entry.tier || 1) === tier);
    selected.push(
      ...pickPracticeEntries(
        tierPool,
        count,
        `practice:${currentDiff.id}:tier:${tier}:${Date.now()}`,
        selectedIds,
        cooldownIds,
      ),
    );
  });

  const questionCount = practiceConfig.questionCount || currentDiff.words || 10;
  if (selected.length < questionCount) {
    selected.push(
      ...pickPracticeEntries(
        rawQuizData,
        questionCount - selected.length,
        `practice:${currentDiff.id}:fill:${Date.now()}`,
        selectedIds,
        cooldownIds,
      ),
    );
  }

  return shuffle(selected);
}

export function buildQuestions({
  mode,
  count,
  quizData,
  rawQuizData,
  currentLang,
  currentDiff,
  sessionDateKey,
  boot,
  storage,
  historyKey,
}) {
  const isDailyMode = mode === "daily";
  const isArchivesMode = mode === "archives";
  const isPracticeMode = mode === "practice";
  const isSeededMode = isDailyMode || isArchivesMode;
  const practiceConfig = getPracticeConfig(boot);
  const pool = isSeededMode
    ? quizData.slice(0, count)
    : isPracticeMode
      ? buildPracticeSession({
          practiceConfig,
          rawQuizData,
          currentDiff,
          storage,
          historyKey,
        }).slice(0, count)
      : shuffle(quizData).slice(0, count);

  return pool.map((question, index) => {
    const correctText = question.correct[currentLang] || question.correct.en;
    const wrongList = question.wrong[currentLang] || question.wrong.en;
    const answerSeed = `${sessionDateKey}:${question.id || question.word}:${currentLang}:${index}`;
    const pickedWrong = isSeededMode
      ? seededShuffle(wrongList, `${answerSeed}:wrong`).slice(0, 3)
      : shuffle(wrongList).slice(0, 3);
    const answers = isSeededMode
      ? seededShuffle([correctText, ...pickedWrong], `${answerSeed}:answers`)
      : shuffle([correctText, ...pickedWrong]);

    return { ...question, correctText, answers };
  });
}
