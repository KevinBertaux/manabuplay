import type {
  ArchiveConfig,
  PracticeConfig,
  QuizBootData,
  QuizEntry,
  QuizQuestion,
  StorageAdapter,
} from "./runtime-types";

export const DAILY_RUN_RECORDS_KEY = "daily_runs";

export interface DailyRunRecord {
  dateKey: string;
  bestScore: number;
  lastScore: number;
  attempts: number;
  correct: number;
  total: number;
  bestStreak: number;
  completedAt: string;
  updatedAt: string;
  dailyCompletedAt: string;
  wordIds: string[];
}

export function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isDailyRunRecord(value: unknown): value is DailyRunRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    "dateKey" in value &&
    "bestScore" in value &&
    "attempts" in value &&
    "dailyCompletedAt" in value
  );
}

export function readDailyRunRecords(storage: StorageAdapter): Record<string, DailyRunRecord> {
  const records = storage.get<Record<string, unknown>>(DAILY_RUN_RECORDS_KEY);
  if (!records || typeof records !== "object" || Array.isArray(records)) return {};

  return Object.fromEntries(
    Object.entries(records).filter((entry): entry is [string, DailyRunRecord] =>
      isDailyRunRecord(entry[1]),
    ),
  );
}

export function getDailyRunRecord(storage: StorageAdapter, dateKey: string) {
  return readDailyRunRecords(storage)[dateKey] || null;
}

export function hasCompletedDailyRun(storage: StorageAdapter, dateKey: string) {
  return Boolean(getDailyRunRecord(storage, dateKey)?.dailyCompletedAt);
}

export function saveDailyRunCompletion({
  storage,
  dateKey,
  score,
  correct,
  total,
  bestStreak,
  questions,
  completedAt = new Date().toISOString(),
}: {
  storage: StorageAdapter;
  dateKey: string;
  score: number;
  correct: number;
  total: number;
  bestStreak: number;
  questions: QuizQuestion[];
  completedAt?: string;
}) {
  const records = readDailyRunRecords(storage);
  const existing = records[dateKey];

  if (existing?.dailyCompletedAt) return existing;

  const record: DailyRunRecord = {
    dateKey,
    bestScore: Math.max(existing?.bestScore || 0, score),
    lastScore: score,
    attempts: (existing?.attempts || 0) + 1,
    correct,
    total,
    bestStreak,
    completedAt: existing?.completedAt || completedAt,
    updatedAt: completedAt,
    dailyCompletedAt: completedAt,
    wordIds: questions.map((question) => question.id),
  };

  records[dateKey] = record;
  storage.set(DAILY_RUN_RECORDS_KEY, records);
  return record;
}

export function saveArchiveRunCompletion({
  storage,
  dateKey,
  score,
  correct,
  total,
  bestStreak,
  questions,
  completedAt = new Date().toISOString(),
}: {
  storage: StorageAdapter;
  dateKey: string;
  score: number;
  correct: number;
  total: number;
  bestStreak: number;
  questions: QuizQuestion[];
  completedAt?: string;
}) {
  const records = readDailyRunRecords(storage);
  const existing = records[dateKey];

  const record: DailyRunRecord = {
    dateKey,
    bestScore: Math.max(existing?.bestScore || 0, score),
    lastScore: score,
    attempts: (existing?.attempts || 0) + 1,
    correct,
    total,
    bestStreak: Math.max(existing?.bestStreak || 0, bestStreak),
    completedAt: existing?.completedAt || completedAt,
    updatedAt: completedAt,
    dailyCompletedAt: existing?.dailyCompletedAt || completedAt,
    wordIds: questions.map((question) => question.id),
  };

  records[dateKey] = record;
  storage.set(DAILY_RUN_RECORDS_KEY, records);
  return record;
}

export function getSessionDateKey({
  mode,
  archiveConfig = {},
  search = "",
}: {
  mode: string;
  archiveConfig?: ArchiveConfig;
  search?: string;
}): string {
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

function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let result = Math.imul(value ^ (value >>> 15), value | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: T[], seedSource: string): T[] {
  const random = mulberry32(hashSeed(seedSource));
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function localizedText(
  value: Record<string, string | undefined> | undefined,
  currentLang: string,
): string {
  return value?.[currentLang] || value?.en || "";
}

function getEntryPackId(entry: QuizEntry) {
  return entry.packId || entry.id.split(":")[0] || "unknown-pack";
}

function getQuizPackIds(pool: QuizEntry[]) {
  return Array.from(new Set(pool.map((entry) => getEntryPackId(entry)))).filter(Boolean);
}

function buildAnswerOptions({
  correctText,
  wrongList,
  fallbackPool,
  currentLang,
  seedSource,
  isSeededMode,
}: {
  correctText: string;
  wrongList: string[];
  fallbackPool: QuizEntry[];
  currentLang: string;
  seedSource: string;
  isSeededMode: boolean;
}) {
  const answers: string[] = [correctText];
  const addCandidate = (candidate: string) => {
    const normalized = candidate.trim();
    if (!normalized || normalized === correctText || answers.includes(normalized)) return;
    answers.push(normalized);
  };

  const shuffledWrong = isSeededMode
    ? seededShuffle(wrongList, `${seedSource}:wrong`)
    : shuffle(wrongList);
  shuffledWrong.forEach(addCandidate);

  const fallbackAnswers = fallbackPool.map((entry) => localizedText(entry.correct, currentLang));
  const shuffledFallbacks = isSeededMode
    ? seededShuffle(fallbackAnswers, `${seedSource}:fallback`)
    : shuffle(fallbackAnswers);
  shuffledFallbacks.forEach(addCandidate);

  const genericFallbacks =
    currentLang === "fr"
      ? ["Une action de combat", "Un objet rare", "Une ressource de jeu"]
      : ["A combat action", "A rare item", "A game resource"];
  genericFallbacks.forEach(addCandidate);

  return isSeededMode
    ? seededShuffle(answers.slice(0, 4), `${seedSource}:answers`)
    : shuffle(answers.slice(0, 4));
}

export function buildDailyQuizData({
  pool,
  dateKey,
  dailyConfig = {},
}: {
  pool: QuizEntry[];
  dateKey: string;
  dailyConfig?: QuizBootData["daily"];
}): QuizEntry[] {
  const targets = dailyConfig?.tierTargets || { 1: 4, 2: 3, 3: 2, 4: 1 };
  const questionCount = dailyConfig?.questionCount || 10;
  const packIds = getQuizPackIds(pool);
  const selectedPackId = seededShuffle(packIds, `${dateKey}:pack`)[0];
  const packPool = selectedPackId
    ? pool.filter((entry) => getEntryPackId(entry) === selectedPackId)
    : pool;
  const selected: QuizEntry[] = [];
  const selectedIds = new Set<string>();

  Object.entries(targets).forEach(([tier, count]) => {
    const tierPool = packPool.filter((entry) => String(entry.tier || 1) === tier);
    seededShuffle(tierPool, `${dateKey}:tier:${tier}`)
      .slice(0, count)
      .forEach((entry) => {
        selected.push(entry);
        selectedIds.add(entry.id);
      });
  });

  if (selected.length < questionCount) {
    seededShuffle(packPool, `${dateKey}:fill`).forEach((entry) => {
      if (selected.length >= questionCount || selectedIds.has(entry.id)) return;
      selected.push(entry);
      selectedIds.add(entry.id);
    });
  }

  return seededShuffle(selected.slice(0, questionCount), `${dateKey}:order`);
}

export function getPracticeConfig(boot: QuizBootData): PracticeConfig {
  return boot.practice || { questionCount: 10, cooldownSessions: 2, recipes: {} };
}

function readPracticeSessions(storage: StorageAdapter, historyKey: string) {
  const sessions = storage.get(historyKey);
  return Array.isArray(sessions) ? sessions : [];
}

function getPracticeCooldownIds({
  storage,
  historyKey,
  practiceConfig,
}: {
  storage: StorageAdapter;
  historyKey: string;
  practiceConfig: PracticeConfig;
}) {
  const cooldownSessions = practiceConfig.cooldownSessions || 2;
  const recentSessions = readPracticeSessions(storage, historyKey).slice(0, cooldownSessions);
  return new Set(
    recentSessions.flatMap((session) => {
      const wordIds =
        typeof session === "object" && session && "wordIds" in session
          ? (session as { wordIds?: string[] }).wordIds
          : [];
      return Array.isArray(wordIds) ? wordIds : [];
    }),
  );
}

function pickPracticePackId(pool: QuizEntry[]) {
  const packIds = getQuizPackIds(pool);
  if (packIds.length === 0) return null;

  return shuffle(packIds)[0];
}

export function savePracticeSession({
  storage,
  historyKey,
  historyLimit,
  diffId,
  questions,
}: {
  storage: StorageAdapter;
  historyKey: string;
  historyLimit: number;
  diffId: string;
  questions: QuizQuestion[];
}) {
  const currentSessions = readPracticeSessions(storage, historyKey);
  const session = {
    diffId,
    packId: questions[0] ? getEntryPackId(questions[0]) : undefined,
    completedAt: new Date().toISOString(),
    wordIds: questions.map((question) => question.id),
  };
  storage.set(historyKey, [session, ...currentSessions].slice(0, historyLimit));
}

function pickPracticeEntries(
  pool: QuizEntry[],
  desiredCount: number,
  seedSource: string,
  selectedIds: Set<string>,
  cooldownIds: Set<string>,
): QuizEntry[] {
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

function buildPracticeSession({
  practiceConfig,
  rawQuizData,
  currentDiff,
  storage,
  historyKey,
}: {
  practiceConfig: PracticeConfig;
  rawQuizData: QuizEntry[];
  currentDiff: { id: string; words: number; tierTargets?: Record<string, number> } | null;
  storage: StorageAdapter;
  historyKey: string;
}): QuizEntry[] {
  if (!currentDiff) return [];

  const tierTargets = currentDiff.tierTargets || practiceConfig.recipes?.[currentDiff.id] || {};
  const selectedPackId = pickPracticePackId(rawQuizData);
  const packQuizData = selectedPackId
    ? rawQuizData.filter((entry) => getEntryPackId(entry) === selectedPackId)
    : rawQuizData;
  const selected: QuizEntry[] = [];
  const selectedIds = new Set<string>();
  const cooldownIds = getPracticeCooldownIds({ storage, historyKey, practiceConfig });

  Object.entries(tierTargets).forEach(([tier, count]) => {
    const tierPool = packQuizData.filter((entry) => String(entry.tier || 1) === tier);
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
        packQuizData,
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
}: {
  mode: string;
  count: number;
  quizData: QuizEntry[];
  rawQuizData: QuizEntry[];
  currentLang: string;
  currentDiff: { id: string; words: number; tierTargets?: Record<string, number> } | null;
  sessionDateKey: string;
  boot: QuizBootData;
  storage: StorageAdapter;
  historyKey: string;
}): QuizQuestion[] {
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
    const correctText = localizedText(question.correct, currentLang);
    const wrongList = question.wrong[currentLang] || question.wrong.en || [];
    const answerSeed = `${sessionDateKey}:${question.id || question.word}:${currentLang}:${index}`;
    const answers = buildAnswerOptions({
      correctText,
      wrongList,
      fallbackPool: rawQuizData.length ? rawQuizData : quizData,
      currentLang,
      seedSource: answerSeed,
      isSeededMode,
    });

    return { ...question, correctText, answers };
  });
}
