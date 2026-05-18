export type RuntimeLocale = "en" | "fr";
export type RuntimeMode = "legacy" | "daily" | "arcade" | "practice" | "archives";

export interface LocalizedTextMap {
  en: string;
  fr?: string;
  [key: string]: string | undefined;
}

export interface QuizEntry {
  id: string;
  packId?: string;
  tier?: number | string;
  word: string;
  kana: string;
  romaji?: string | null;
  cat: LocalizedTextMap;
  correct: LocalizedTextMap;
  wrong: Record<string, string[]>;
  hint?: string | LocalizedTextMap;
  hint2?: string | LocalizedTextMap;
  explanation?: string | LocalizedTextMap;
}

export interface QuizQuestion extends QuizEntry {
  correctText: string;
  answers: string[];
}

export interface Difficulty {
  id: string;
  icon: string;
  words: number;
  color: string;
  cls: string;
  tierTargets?: Record<string, number>;
}

export interface ResultTier {
  min: number;
  emoji: string;
  title: string;
  msg: string;
}

export type BootTranslationValue = string | ResultTier[] | undefined;
export type BootLangMap = Record<string, BootTranslationValue>;

export interface DailyConfig {
  tierTargets?: Record<string, number>;
  questionCount?: number;
  startDate?: string;
  wordCooldownDays?: number;
  packCooldownDays?: number;
}

export interface PracticeConfig {
  questionCount?: number;
  cooldownSessions?: number;
  recipes?: Record<string, Record<string, number>>;
}

export interface ArchiveConfig {
  selectedDate?: string;
  startDate?: string;
  latestDate?: string;
  questionCount?: number;
}

export interface QuizBootData {
  mode?: RuntimeMode | string;
  difficulties: Difficulty[];
  lang: Record<string, BootLangMap>;
  quizData: QuizEntry[];
  daily?: DailyConfig;
  practice?: PracticeConfig;
  archive?: ArchiveConfig;
}

export interface RuntimeState {
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  streak: number;
  bestStreak: number;
  answered: boolean;
  correct: number;
}

export interface StorageAdapter {
  get<T = unknown>(key: string): T | null;
  set(key: string, value: unknown): void;
  getBest(diffId: string): number;
  setBest(diffId: string, score: number): boolean;
  getLang(): string;
  setLang(lang: string): void;
}

export interface PracticeSession {
  diffId: string;
  packId?: string;
  completedAt: string;
  wordIds: string[];
}

export interface WaitlistSubmission {
  email: string;
  lang: string;
  source: string;
  formName: string;
  createdAt: string;
  page: string;
}
