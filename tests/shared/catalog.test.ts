import { describe, expect, it } from "vitest";
import {
  buildCatalogBootData,
  buildCatalogQuizData,
  buildCatalogPackQuizData,
  DIFFICULTIES,
  MANABU_CATALOG,
  PACK_ENTRIES,
  PACKS,
  RELEASES,
  WORDS,
} from "../../shared/data/manabuplay/catalog";

describe("catalog", () => {
  it("exposes the frozen release, pack, and difficulty metadata", () => {
    expect(RELEASES).toHaveLength(1);
    expect(PACKS).toHaveLength(5);
    expect(PACKS.map((pack) => pack.id)).toEqual([
      "jrpg-essentials",
      "combat-and-boss",
      "classes-weapons-equipment",
      "anime-codes",
      "gacha-live-service",
    ]);
    expect(DIFFICULTIES.length).toBeGreaterThan(0);
    expect(MANABU_CATALOG.defaultPackId).toBe("jrpg-essentials");
  });

  it("creates unique word ids and mirrored pack entries", () => {
    const ids = new Set(WORDS.map((word) => word.id));

    expect(ids.size).toBe(WORDS.length);
    expect(PACK_ENTRIES).toHaveLength(WORDS.length);
    expect(WORDS).toHaveLength(170);

    for (const pack of PACKS) {
      const entries = PACK_ENTRIES.filter((entry) => entry.packId === pack.id);
      expect(entries).toHaveLength(34);
      expect(entries.every((entry, index) => entry.order === index + 1)).toBe(true);
    }
  });

  it("builds canonical runtime quiz data for the full v0.1 corpus", () => {
    const quizData = buildCatalogQuizData();

    expect(quizData).toHaveLength(WORDS.length);
    expect(quizData[0]).toHaveProperty("word");
    expect(quizData[0]).toHaveProperty("id");
    expect(quizData[0]).toHaveProperty("hint2");
    expect(quizData[0]).toHaveProperty("explanation");
    expect(quizData[0]).toHaveProperty("correct");
    expect(quizData[0]).toHaveProperty("wrong");
  });

  it("provides three localized distractors for every runtime quiz entry", () => {
    const quizData = buildCatalogQuizData();

    expect(quizData.every((entry) => entry.wrong.fr.length === 3)).toBe(true);
    expect(quizData.every((entry) => entry.wrong.en.length === 3)).toBe(true);
  });

  it("builds pack-level quiz data for a specific canonical pack", () => {
    const quizData = buildCatalogPackQuizData("jrpg-essentials");

    expect(quizData).toHaveLength(34);
    expect(quizData.every((entry) => entry.id.startsWith("jrpg-essentials:"))).toBe(true);
  });

  it("returns an empty quiz list for an unknown pack", () => {
    expect(buildCatalogPackQuizData("unknown-pack")).toEqual([]);
  });

  it("throws if a pack entry references an unknown word id", () => {
    const originalWordId = PACK_ENTRIES[0]?.wordId;
    if (!originalWordId) {
      throw new Error("Expected at least one pack entry.");
    }

    PACK_ENTRIES[0].wordId = "missing-word";

    try {
      expect(() => buildCatalogPackQuizData()).toThrow(/Unknown wordId/);
    } finally {
      PACK_ENTRIES[0].wordId = originalWordId;
    }
  });

  it("builds the catalog boot payload from the catalog", () => {
    const payload = buildCatalogBootData();

    expect(payload.catalog.defaultPackId).toBe("jrpg-essentials");
    expect(payload.quizData).toHaveLength(WORDS.length);
    expect(payload.difficulties).toEqual(DIFFICULTIES);
    expect(payload.lang).toHaveProperty("en");
    expect(payload.lang).toHaveProperty("fr");
    expect(payload.lang.en.stat_words).toBe("170 WORDS");
    expect(payload.lang.fr.stat_words).toBe("170 MOTS");
  });
});
