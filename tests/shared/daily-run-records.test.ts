import { describe, expect, it } from "vitest";
import {
  DAILY_RUN_RECORDS_KEY,
  getDailyRunRecord,
  hasCompletedDailyRun,
  saveDailyRunCompletion,
} from "../../apps/web/src/scripts/quiz-app/session";
import type {
  QuizQuestion,
  StorageAdapter,
} from "../../apps/web/src/scripts/quiz-app/runtime-types";

function createStorage(): StorageAdapter {
  const values = new Map<string, unknown>();

  return {
    get<T = unknown>(key: string): T | null {
      return (values.get(key) as T | undefined) ?? null;
    },
    set(key: string, value: unknown) {
      values.set(key, value);
    },
    getBest: () => 0,
    setBest: () => false,
    getLang: () => "fr",
    setLang(lang: string) {
      values.set("lang", lang);
    },
  };
}

const QUESTIONS = [
  {
    id: "quest",
    word: "クエスト",
    kana: "クエスト",
    cat: { en: "Quest", fr: "Quête" },
    correct: { en: "Quest", fr: "Quête" },
    wrong: { en: [], fr: [] },
    correctText: "Quête",
    answers: [],
  },
  {
    id: "boss",
    word: "ボス",
    kana: "ボス",
    cat: { en: "Boss", fr: "Boss" },
    correct: { en: "Boss", fr: "Boss" },
    wrong: { en: [], fr: [] },
    correctText: "Boss",
    answers: [],
  },
] satisfies QuizQuestion[];

describe("daily run records", () => {
  it("stores one counted daily attempt by date", () => {
    const storage = createStorage();

    const record = saveDailyRunCompletion({
      storage,
      dateKey: "2026-05-04",
      score: 84,
      correct: 8,
      total: 10,
      bestStreak: 4,
      questions: QUESTIONS,
      completedAt: "2026-05-04T08:00:00.000Z",
    });

    expect(record).toMatchObject({
      dateKey: "2026-05-04",
      bestScore: 84,
      lastScore: 84,
      attempts: 1,
      correct: 8,
      total: 10,
      bestStreak: 4,
      dailyCompletedAt: "2026-05-04T08:00:00.000Z",
      wordIds: ["quest", "boss"],
    });
    expect(hasCompletedDailyRun(storage, "2026-05-04")).toBe(true);
    expect(getDailyRunRecord(storage, "2026-05-04")?.bestScore).toBe(84);
  });

  it("does not count a second daily replay for the same date", () => {
    const storage = createStorage();

    saveDailyRunCompletion({
      storage,
      dateKey: "2026-05-04",
      score: 84,
      correct: 8,
      total: 10,
      bestStreak: 4,
      questions: QUESTIONS,
      completedAt: "2026-05-04T08:00:00.000Z",
    });
    saveDailyRunCompletion({
      storage,
      dateKey: "2026-05-04",
      score: 120,
      correct: 10,
      total: 10,
      bestStreak: 10,
      questions: QUESTIONS,
      completedAt: "2026-05-04T09:00:00.000Z",
    });

    const records = storage.get<Record<string, unknown>>(DAILY_RUN_RECORDS_KEY);
    expect(records?.["2026-05-04"]).toMatchObject({
      bestScore: 84,
      attempts: 1,
      dailyCompletedAt: "2026-05-04T08:00:00.000Z",
    });
  });
});
