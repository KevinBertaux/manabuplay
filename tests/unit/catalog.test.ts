import { describe, expect, it } from "vitest";
import {
  buildLegacyQuizData,
  buildMvpBootData,
  DIFFICULTIES,
  MANABU_CATALOG,
  PACK_ENTRIES,
  PACKS,
  RELEASES,
  WORDS,
} from "../../src/data/manabuplay/catalog";

describe("catalog", () => {
  it("exposes the frozen release, pack, and difficulty metadata", () => {
    expect(RELEASES).toHaveLength(1);
    expect(PACKS).toHaveLength(1);
    expect(DIFFICULTIES.length).toBeGreaterThan(0);
    expect(MANABU_CATALOG.defaultPackId).toBe("gaming-core");
  });

  it("creates unique word ids and mirrored pack entries", () => {
    const ids = new Set(WORDS.map((word) => word.id));

    expect(ids.size).toBe(WORDS.length);
    expect(PACK_ENTRIES).toHaveLength(WORDS.length);
    expect(PACK_ENTRIES.every((entry, index) => entry.order === index + 1)).toBe(true);
  });

  it("builds legacy quiz data for the default pack", () => {
    const quizData = buildLegacyQuizData();

    expect(quizData.length).toBe(WORDS.length);
    expect(quizData[0]).toHaveProperty("word");
    expect(quizData[0]).toHaveProperty("correct");
    expect(quizData[0]).toHaveProperty("wrong");
  });

  it("returns an empty quiz list for an unknown pack", () => {
    expect(buildLegacyQuizData("unknown-pack")).toEqual([]);
  });

  it("throws if a pack entry references an unknown word id", () => {
    const originalWordId = PACK_ENTRIES[0]?.wordId;
    if (!originalWordId) {
      throw new Error("Expected at least one pack entry.");
    }

    PACK_ENTRIES[0].wordId = "missing-word";

    try {
      expect(() => buildLegacyQuizData()).toThrow(/Unknown wordId/);
    } finally {
      PACK_ENTRIES[0].wordId = originalWordId;
    }
  });

  it("builds the MVP boot payload from the catalog", () => {
    const payload = buildMvpBootData();

    expect(payload.catalog.defaultPackId).toBe("gaming-core");
    expect(payload.quizData).toHaveLength(WORDS.length);
    expect(payload.difficulties).toEqual(DIFFICULTIES);
    expect(payload.lang).toHaveProperty("en");
    expect(payload.lang).toHaveProperty("fr");
  });
});
