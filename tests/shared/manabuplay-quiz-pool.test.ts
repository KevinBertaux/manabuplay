import { describe, expect, it } from "vitest";
import { buildCatalogQuizData } from "../../shared/data/manabuplay/catalog";
import { buildV01QuizPool } from "../../shared/lib/manabuplay-quiz-pool";

describe("manabuplay quiz pool", () => {
  it("reuses the canonical catalog quiz corpus without rebuilding a second truth", () => {
    expect(buildV01QuizPool()).toEqual(buildCatalogQuizData());
  });

  it("keeps tier coverage across the full v0.1 corpus", () => {
    const tiers = new Set(buildV01QuizPool().map((entry) => entry.tier));

    expect(tiers).toEqual(new Set([1, 2, 3, 4]));
  });
});
