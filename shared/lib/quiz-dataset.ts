import type { CatalogQuizEntry } from "../data/manabuplay/catalog";

/** Daily/archives runs are resolved in the browser from the embedded catalog pool (local date key).
 *  Builds ship the full pool only — never SSG question sets per date. */

export interface QuizPoolEntry {
  id: string;
  packId?: string;
  tier?: number | string;
  word: string;
  kana: string;
  romaji?: string | null;
  cat: Record<string, string | undefined>;
  correct: Record<string, string | undefined>;
  wrong: Record<string, string[]>;
  hint?: string | Record<string, string | undefined>;
  hint2?: string | Record<string, string | undefined>;
  explanation?: string | Record<string, string | undefined>;
}

export type CatalogQuizPoolEntry = CatalogQuizEntry;

export interface DailyQuizConfig {
  tierTargets?: Record<string, number>;
  questionCount?: number;
  startDate?: string;
  wordCooldownDays?: number;
  packCooldownDays?: number;
}

export interface ArchiveQuizConfig {
  selectedDate?: string;
  startDate?: string;
  latestDate?: string;
  questionCount?: number;
}

export interface QuizDatasetBoot {
  mode?: string;
  daily?: DailyQuizConfig;
  archive?: ArchiveQuizConfig;
}

export interface QuizSessionConfig<T extends QuizPoolEntry = QuizPoolEntry> {
  mode: string;
  locale: string;
  sessionDateKey: string;
  rawQuizData: T[];
  quizData: T[];
  boot: QuizDatasetBoot;
}

export interface ResolveQuizDatasetInput<T extends QuizPoolEntry = QuizPoolEntry> {
  mode: string;
  pool: T[];
  boot: QuizDatasetBoot;
  locale: string;
  search?: string;
  dateKey?: string;
  now?: Date;
}

export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getSessionDateKey({
  mode,
  archiveConfig = {},
  search = "",
  now = new Date(),
}: {
  mode: string;
  archiveConfig?: ArchiveQuizConfig;
  search?: string;
  now?: Date;
}): string {
  if (mode !== "archives") {
    return getLocalDateKey(now);
  }

  const selectedFromQuery = new URLSearchParams(search).get("date");
  const selectedDate = selectedFromQuery || archiveConfig.selectedDate || getLocalDateKey(now);
  const startDate = archiveConfig.startDate || selectedDate;
  const latestDate = archiveConfig.latestDate || selectedDate;
  const isValidFormat = /^\d{4}-\d{2}-\d{2}$/.test(selectedDate);

  if (isValidFormat && selectedDate >= startDate && selectedDate <= latestDate) {
    return selectedDate;
  }

  return archiveConfig.selectedDate || latestDate || getLocalDateKey(now);
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

function getEntryPackId(entry: QuizPoolEntry) {
  return entry.packId || entry.id.split(":")[0] || "unknown-pack";
}

function getQuizPackIds(pool: QuizPoolEntry[]) {
  return Array.from(new Set(pool.map((entry) => getEntryPackId(entry)))).filter(Boolean);
}

function getPreviousDateKey(dateKey: string, daysBack: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - daysBack);
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function countAvailableTiers(pool: QuizPoolEntry[]) {
  return pool.reduce<Record<string, number>>((counts, entry) => {
    const tier = String(entry.tier || 1);
    counts[tier] = (counts[tier] || 0) + 1;
    return counts;
  }, {});
}

function buildDailyQuestionsForDate({
  pool,
  dateKey,
  targets,
  questionCount,
  excludedWordIds,
  excludedPackIds,
}: {
  pool: QuizPoolEntry[];
  dateKey: string;
  targets: Record<string, number>;
  questionCount: number;
  excludedWordIds: Set<string>;
  excludedPackIds: Set<string>;
}) {
  const packIds = getQuizPackIds(pool);
  const shuffledPackIds = seededShuffle(packIds, `${dateKey}:pack`);
  const canBuildPack = (packId: string) => {
    const eligiblePackPool = pool.filter(
      (entry) => getEntryPackId(entry) === packId && !excludedWordIds.has(entry.id),
    );
    const tierCounts = countAvailableTiers(eligiblePackPool);
    const availableCount = Object.entries(targets).reduce(
      (total, [tier, count]) => total + Math.min(tierCounts[tier] || 0, count),
      0,
    );

    return (
      availableCount >= questionCount &&
      Object.entries(targets).every(([tier, count]) => (tierCounts[tier] || 0) >= count)
    );
  };
  const selectedPackId =
    shuffledPackIds.find((packId) => !excludedPackIds.has(packId) && canBuildPack(packId)) ||
    shuffledPackIds.find(canBuildPack);

  if (!selectedPackId) {
    throw new Error(
      `Daily quiz cannot satisfy cooldown and tier targets for ${dateKey}. Add pack capacity or relax daily constraints.`,
    );
  }

  const packPool = selectedPackId
    ? pool.filter((entry) => getEntryPackId(entry) === selectedPackId)
    : [];
  const eligiblePackPool = packPool.filter((entry) => !excludedWordIds.has(entry.id));
  const selected: QuizPoolEntry[] = [];
  const selectedIds = new Set<string>();

  Object.entries(targets).forEach(([tier, count]) => {
    const tierPool = eligiblePackPool.filter((entry) => String(entry.tier || 1) === tier);
    seededShuffle(tierPool, `${dateKey}:tier:${tier}`)
      .slice(0, count)
      .forEach((entry) => {
        selected.push(entry);
        selectedIds.add(entry.id);
      });
  });

  return seededShuffle(selected.slice(0, questionCount), `${dateKey}:order`);
}

export function buildDailyQuizData({
  pool,
  dateKey,
  dailyConfig = {},
}: {
  pool: QuizPoolEntry[];
  dateKey: string;
  dailyConfig?: DailyQuizConfig;
}): QuizPoolEntry[] {
  const targets = dailyConfig?.tierTargets || { 1: 4, 2: 3, 3: 2, 4: 1 };
  const questionCount = dailyConfig?.questionCount || 10;
  const startDate = dailyConfig?.startDate || "2026-01-01";
  const wordCooldownDays = dailyConfig?.wordCooldownDays ?? 7;
  const packCooldownDays = dailyConfig?.packCooldownDays ?? 1;
  const memo = new Map<string, QuizPoolEntry[]>();

  const buildForDate = (currentDateKey: string): QuizPoolEntry[] => {
    const cached = memo.get(currentDateKey);
    if (cached) return cached;

    const previousQuestions: QuizPoolEntry[][] = [];
    const cooldownWindow = Math.max(wordCooldownDays, packCooldownDays);
    for (let daysBack = 1; daysBack <= cooldownWindow; daysBack += 1) {
      const previousDateKey = getPreviousDateKey(currentDateKey, daysBack);
      if (previousDateKey < startDate) continue;
      previousQuestions.push(buildForDate(previousDateKey));
    }

    const excludedWordIds = new Set(
      previousQuestions
        .slice(0, wordCooldownDays)
        .flatMap((questions) => questions.map((question) => question.id)),
    );
    const excludedPackIds = new Set(
      previousQuestions
        .slice(0, packCooldownDays)
        .map((questions) => questions[0])
        .filter((question): question is QuizPoolEntry => Boolean(question))
        .map(getEntryPackId),
    );
    const questions = buildDailyQuestionsForDate({
      pool,
      dateKey: currentDateKey,
      targets,
      questionCount,
      excludedWordIds,
      excludedPackIds,
    });
    memo.set(currentDateKey, questions);
    return questions;
  };

  return buildForDate(dateKey);
}

function isSeededQuizMode(mode: string) {
  return mode === "daily" || mode === "archives";
}

export function resolveQuizDataset<T extends QuizPoolEntry>({
  mode,
  pool,
  boot,
  locale,
  search = "",
  dateKey,
  now = new Date(),
}: ResolveQuizDatasetInput<T>): QuizSessionConfig<T> {
  const sessionDateKey =
    dateKey ??
    getSessionDateKey({
      mode,
      archiveConfig: boot.archive ?? {},
      search,
      now,
    });

  const quizData = (
    isSeededQuizMode(mode)
      ? buildDailyQuizData({
          pool,
          dateKey: sessionDateKey,
          dailyConfig: boot.daily ?? {},
        })
      : pool
  ) as T[];

  return {
    mode,
    locale,
    sessionDateKey,
    rawQuizData: pool,
    quizData,
    boot,
  };
}
