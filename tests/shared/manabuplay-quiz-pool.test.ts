import { describe, expect, it } from "vitest";
import { buildCatalogQuizData } from "../../shared/data/manabuplay/catalog";
import { buildV01QuizPool } from "../../shared/lib/manabuplay-quiz-pool";
import { buildDailyQuizData, buildQuestions } from "../../apps/web/src/scripts/quiz-app/session";
import type { StorageAdapter } from "../../apps/web/src/scripts/quiz-app/runtime-types";

const storage: StorageAdapter = {
  get: () => null,
  set: () => {},
  getBest: () => 0,
  setBest: () => false,
  getLang: () => "fr",
  setLang: () => {},
};

const dailyConfig = {
  questionCount: 10,
  startDate: "2026-01-01",
  wordCooldownDays: 7,
  packCooldownDays: 1,
  tierTargets: { 1: 4, 2: 3, 3: 2, 4: 1 },
};

function getDateKeyFromStart(daysFromStart: number) {
  const date = new Date(Date.UTC(2026, 0, 1));
  date.setUTCDate(date.getUTCDate() + daysFromStart);
  return date.toISOString().slice(0, 10);
}

describe("manabuplay quiz pool", () => {
  it("reuses the canonical catalog quiz corpus without rebuilding a second truth", () => {
    expect(buildV01QuizPool()).toEqual(buildCatalogQuizData());
  });

  it("keeps tier coverage across the full v0.1 corpus", () => {
    const tiers = new Set(buildV01QuizPool().map((entry) => entry.tier));

    expect(tiers).toEqual(new Set([1, 2, 3, 4]));
  });

  it("builds playable questions with four unique answers", () => {
    const quizData = buildCatalogQuizData();
    const questions = buildQuestions({
      mode: "practice",
      count: 10,
      quizData,
      rawQuizData: quizData,
      currentLang: "fr",
      currentDiff: { id: "standard", words: 10, tierTargets: { 1: 4, 2: 3, 3: 2, 4: 1 } },
      sessionDateKey: "2026-04-28",
      boot: {
        mode: "practice",
        difficulties: [],
        lang: {},
        quizData,
        practice: { questionCount: 10, cooldownSessions: 2, recipes: {} },
      },
      storage,
      historyKey: "test_practice_sessions",
    });

    expect(questions).toHaveLength(10);
    expect(
      questions.every((question) => {
        const uniqueAnswers = new Set(question.answers);
        return question.answers.length === 4 && uniqueAnswers.size === 4;
      }),
    ).toBe(true);
  });

  it("keeps a dated daily run inside one deterministic pack", () => {
    const quizData = buildCatalogQuizData();
    const dailyQuestions = buildDailyQuizData({
      pool: quizData,
      dateKey: "2026-05-05",
      dailyConfig,
    });
    const secondBuild = buildDailyQuizData({
      pool: quizData,
      dateKey: "2026-05-05",
      dailyConfig,
    });
    const packIds = new Set(dailyQuestions.map((question) => question.packId));

    expect(dailyQuestions).toHaveLength(10);
    expect(packIds.size).toBe(1);
    expect(dailyQuestions.map((question) => question.id)).toEqual(
      secondBuild.map((question) => question.id),
    );
    expect(dailyQuestions.every((question) => question.id.startsWith(`${question.packId}:`))).toBe(
      true,
    );
  });

  it("avoids repeating recent daily words and yesterday's pack", () => {
    const quizData = buildCatalogQuizData();
    const previousDaily = buildDailyQuizData({
      pool: quizData,
      dateKey: "2026-05-09",
      dailyConfig,
    });
    const todayDaily = buildDailyQuizData({
      pool: quizData,
      dateKey: "2026-05-10",
      dailyConfig,
    });
    const previousIds = new Set(previousDaily.map((question) => question.id));
    const previousPackIds = new Set(previousDaily.map((question) => question.packId));
    const todayPackIds = new Set(todayDaily.map((question) => question.packId));
    const recentIds = new Set(
      Array.from({ length: 7 }, (_, index) => `2026-05-${String(index + 3).padStart(2, "0")}`)
        .flatMap((dateKey) =>
          buildDailyQuizData({
            pool: quizData,
            dateKey,
            dailyConfig,
          }),
        )
        .map((question) => question.id),
    );

    expect(todayDaily).toHaveLength(10);
    expect(todayDaily.some((question) => previousIds.has(question.id))).toBe(false);
    expect(todayDaily.some((question) => recentIds.has(question.id))).toBe(false);
    expect(todayPackIds.size).toBe(1);
    expect([...todayPackIds].some((packId) => previousPackIds.has(packId))).toBe(false);
    expect(
      todayDaily.some((question) => question.id === "anime-codes:anime-codes-magical-girl"),
    ).toBe(false);
  });

  it("keeps daily cooldown, pack rotation, and tier ratio stable across a full year", () => {
    const quizData = buildCatalogQuizData();
    const history: Array<{ ids: string[]; packId: string }> = [];

    for (let dayIndex = 0; dayIndex < 365; dayIndex += 1) {
      const dailyQuestions = buildDailyQuizData({
        pool: quizData,
        dateKey: getDateKeyFromStart(dayIndex),
        dailyConfig,
      });
      const ids = dailyQuestions.map((question) => question.id);
      const packIds = new Set(dailyQuestions.map((question) => question.packId));
      const tierCounts = dailyQuestions.reduce<Record<string, number>>((counts, question) => {
        const tier = String(question.tier || 1);
        counts[tier] = (counts[tier] || 0) + 1;
        return counts;
      }, {});
      const recentIds = new Set(history.slice(-7).flatMap((daily) => daily.ids));
      const previousPackId = history.at(-1)?.packId;

      expect(dailyQuestions).toHaveLength(10);
      expect(packIds.size).toBe(1);
      expect(ids.some((id) => recentIds.has(id))).toBe(false);
      expect([...packIds][0]).not.toBe(previousPackId);
      expect(tierCounts).toEqual({ 1: 4, 2: 3, 3: 2, 4: 1 });

      history.push({ ids, packId: [...packIds][0] || "" });
    }
  });

  it("keeps a practice run inside one random pack", () => {
    const quizData = buildCatalogQuizData();
    const questions = buildQuestions({
      mode: "practice",
      count: 10,
      quizData,
      rawQuizData: quizData,
      currentLang: "fr",
      currentDiff: { id: "normal", words: 10, tierTargets: { 1: 4, 2: 3, 3: 2, 4: 1 } },
      sessionDateKey: "2026-04-28",
      boot: {
        mode: "practice",
        difficulties: [],
        lang: {},
        quizData,
        practice: { questionCount: 10, cooldownSessions: 2, recipes: {} },
      },
      storage,
      historyKey: "test_practice_sessions",
    });

    const packIds = new Set(questions.map((question) => question.packId));

    expect(questions).toHaveLength(10);
    expect(packIds.size).toBe(1);
    expect(questions.every((question) => question.id.startsWith(`${question.packId}:`))).toBe(true);
  });
});
