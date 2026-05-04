import { describe, expect, it } from "vitest";
import { buildCatalogQuizData } from "../../shared/data/manabuplay/catalog";
import { buildV01QuizPool } from "../../shared/lib/manabuplay-quiz-pool";
import { buildQuestions } from "../../apps/web/src/scripts/quiz-app/session";
import type { StorageAdapter } from "../../apps/web/src/scripts/quiz-app/runtime-types";

const storage: StorageAdapter = {
  get: () => null,
  set: () => {},
  getBest: () => 0,
  setBest: () => false,
  getLang: () => "fr",
  setLang: () => {},
};

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
});
