import { describe, expect, it } from "vitest";
import {
  buildCatalogBootData,
  buildCatalogQuizData,
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
    expect(DIFFICULTIES.length).toBeGreaterThan(0);
    expect(MANABU_CATALOG.defaultPackId).toBe("jrpg-essentials");
  });

  it("creates unique word ids and mirrored pack entries", () => {
    const ids = new Set(WORDS.map((word) => word.id));

    expect(ids.size).toBe(WORDS.length);
    expect(PACK_ENTRIES).toHaveLength(WORDS.length);
    expect(WORDS).toHaveLength(150);

    for (const pack of PACKS) {
      const entries = PACK_ENTRIES.filter((entry) => entry.packId === pack.id);
      expect(entries).toHaveLength(30);
      expect(entries.every((entry, index) => entry.order === index + 1)).toBe(true);
    }
  });

  it("builds canonical quiz data for the default pack", () => {
    const quizData = buildCatalogQuizData();

    expect(quizData).toHaveLength(30);
    expect(quizData[0]).toHaveProperty("word");
    expect(quizData[0]).toHaveProperty("correct");
    expect(quizData[0]).toHaveProperty("wrong");
  });

  it("returns an empty quiz list for an unknown pack", () => {
    expect(buildCatalogQuizData("unknown-pack")).toEqual([]);
  });

  it("throws if a pack entry references an unknown word id", () => {
    const originalWordId = PACK_ENTRIES[0]?.wordId;
    if (!originalWordId) {
      throw new Error("Expected at least one pack entry.");
    }

    PACK_ENTRIES[0].wordId = "missing-word";

    try {
      expect(() => buildCatalogQuizData()).toThrow(/Unknown wordId/);
    } finally {
      PACK_ENTRIES[0].wordId = originalWordId;
    }
  });

  it("builds the catalog boot payload from the catalog", () => {
    const payload = buildCatalogBootData();

    expect(payload.catalog.defaultPackId).toBe("jrpg-essentials");
    expect(payload.quizData).toHaveLength(30);
    expect(payload.difficulties).toEqual(DIFFICULTIES);
    expect(payload.lang).toHaveProperty("en");
    expect(payload.lang).toHaveProperty("fr");
    expect(payload.lang.en.stat_words).toBe("150 WORDS");
    expect(payload.lang.fr.stat_words).toBe("150 MOTS");
  });
});
