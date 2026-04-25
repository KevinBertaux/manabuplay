import { describe, expect, it } from "vitest";
import { getAllPacks, getPackById, getPackIndex } from "../../shared/lib/manabuplay-pack-reader";

describe("manabuplay pack reader", () => {
  const expectedPackSignals = {
    "jrpg-questline": {
      readiness: 84,
      breakdown: {
        packSize: 15,
        tierFit: 15,
        contentCompleteness: 40,
        quizQuality: 13,
        editorialReview: 1,
      },
      transparency: {
        strictCount: 0,
        editorialCount: 7,
        fillerCount: 0,
        weightedScore: 3.5,
        weightedPercent: 10,
        tone: "ok",
      },
    },
    "combat-and-boss": {
      readiness: 96,
      breakdown: {
        packSize: 15,
        tierFit: 15,
        contentCompleteness: 40,
        quizQuality: 13,
        editorialReview: 13,
      },
      transparency: {
        strictCount: 0,
        editorialCount: 5,
        fillerCount: 0,
        weightedScore: 2.5,
        weightedPercent: 7,
        tone: "ok",
      },
    },
    "builds-and-gear": {
      readiness: 96,
      breakdown: {
        packSize: 15,
        tierFit: 15,
        contentCompleteness: 40,
        quizQuality: 13,
        editorialReview: 13,
      },
      transparency: {
        strictCount: 1,
        editorialCount: 7,
        fillerCount: 0,
        weightedScore: 4.5,
        weightedPercent: 13,
        tone: "watch",
      },
    },
    "anime-codes": {
      readiness: 96,
      breakdown: {
        packSize: 15,
        tierFit: 15,
        contentCompleteness: 40,
        quizQuality: 13,
        editorialReview: 13,
      },
      transparency: {
        strictCount: 1,
        editorialCount: 1,
        fillerCount: 0,
        weightedScore: 1.5,
        weightedPercent: 4,
        tone: "ok",
      },
    },
    "gacha-and-rewards": {
      readiness: 70,
      breakdown: {
        packSize: 15,
        tierFit: 15,
        contentCompleteness: 40,
        quizQuality: 0,
        editorialReview: 0,
      },
      transparency: {
        strictCount: 1,
        editorialCount: 9,
        fillerCount: 0,
        weightedScore: 5.5,
        weightedPercent: 16,
        tone: "watch",
      },
    },
  } as const;

  it("loads the pack index", () => {
    const index = getPackIndex();

    expect(index.packs).toHaveLength(5);
    expect(index.packs[0]).toHaveProperty("id");
    expect(index.packs[0]).toHaveProperty("path");
  });

  it("returns null for an unknown pack id", () => {
    expect(getPackById("unknown-pack")).toBeNull();
  });

  it("hydrates a pack with tier and transparent breakdowns", () => {
    const pack = getPackById("jrpg-questline");

    expect(pack).toBeTruthy();
    expect(pack?.words).toHaveLength(34);
    expect(pack?.tierBreakdown?.total).toBe(34);
    expect(pack?.tierBreakdown?.counts[1]).toBeGreaterThan(0);
    expect(pack?.transparentBreakdown?.weightedScore).toBeGreaterThanOrEqual(0);
    expect(["ok", "watch", "act"]).toContain(pack?.transparentBreakdown?.tone);
  });

  it("weights strict, editorial and filler transparency separately", () => {
    const pack = getPackById("gacha-and-rewards");

    expect(pack?.transparentBreakdown?.strictCount).toBe(1);
    expect(pack?.transparentBreakdown?.editorialCount).toBe(9);
    expect(pack?.transparentBreakdown?.fillerCount).toBe(0);
    expect(pack?.transparentBreakdown?.weightedScore).toBe(5.5);
    expect(pack?.transparentBreakdown?.weightedPercent).toBe(16);
    expect(pack?.transparentBreakdown?.tone).toBe("watch");
  });

  it("exposes normalized readiness and transparency signals for every active pack", () => {
    for (const [packId, expected] of Object.entries(expectedPackSignals)) {
      const pack = getPackById(packId);

      expect(pack?.score?.readiness?.value).toBe(expected.readiness);
      expect(pack?.score?.readiness?.breakdown).toEqual(expected.breakdown);
      expect(pack?.score?.readiness?.readyForProd).toBe(false);
      expect(pack?.transparentBreakdown).toMatchObject(expected.transparency);
    }
  });

  it("builds quiz previews with four answers and a shared correct index", () => {
    const pack = getPackById("anime-codes");
    const word = pack?.words.find((entry) => entry.quizPreview);

    expect(word).toBeTruthy();
    expect(word?.quizPreview?.answers.fr).toHaveLength(4);
    expect(word?.quizPreview?.answers.en).toHaveLength(4);
    expect(word?.quizPreview?.correctIndex.fr).toBe(word?.quizPreview?.correctIndex.en);
    expect(word?.quizPreview?.answers.fr[word?.quizPreview?.correctIndex.fr ?? 0]).toBe(
      word?.quizPreview?.correct.fr,
    );
    expect(word?.quizPreview?.answers.en[word?.quizPreview?.correctIndex.en ?? 0]).toBe(
      word?.quizPreview?.correct.en,
    );
  });

  it("keeps per-word review status for packs with non-linear replacements", () => {
    const pack = getPackById("jrpg-questline");
    const words = pack?.words ?? [];

    expect(words.filter((word) => word.editorialReview?.status === "reviewed")).toHaveLength(16);
    expect(words.filter((word) => word.editorialReview?.status === "needs-review")).toHaveLength(
      18,
    );
    expect(words.find((word) => word.existingWordId === "spell")?.editorialReview?.status).toBe(
      "needs-review",
    );
    expect(
      words.find((word) => word.existingWordId === "keiken-chi-exp")?.editorialReview?.status,
    ).toBe("reviewed");
  });

  it("still builds previews for planned words that do not have a legacy word id", () => {
    const pack = getPackById("gacha-and-rewards");
    const plannedWord = pack?.words.find((entry) => !entry.existingWordId);

    expect(plannedWord).toBeTruthy();
    expect(plannedWord?.quizPreview?.distractors.fr).toHaveLength(3);
    expect(plannedWord?.quizPreview?.distractors.en).toHaveLength(3);
    expect(plannedWord?.quizPreview?.correct.fr.length).toBeGreaterThan(0);
    expect(plannedWord?.quizPreview?.correct.en.length).toBeGreaterThan(0);
  });

  it("returns all packs from the current v0.1 index", () => {
    const packs = getAllPacks();

    expect(packs).toHaveLength(5);
    expect(packs.every((pack) => pack.words.length > 0)).toBe(true);
  });
});
