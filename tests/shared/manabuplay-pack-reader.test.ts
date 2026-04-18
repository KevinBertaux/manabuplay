import { describe, expect, it } from "vitest";
import { getAllPacks, getPackById, getPackIndex } from "../../shared/lib/manabuplay-pack-reader";

describe("manabuplay pack reader", () => {
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
    const pack = getPackById("jrpg-essentials");

    expect(pack).toBeTruthy();
    expect(pack?.words).toHaveLength(30);
    expect(pack?.tierBreakdown?.total).toBe(30);
    expect(pack?.tierBreakdown?.counts[1]).toBeGreaterThan(0);
    expect(pack?.transparentBreakdown?.count).toBeGreaterThanOrEqual(0);
    expect(["ok", "watch", "act"]).toContain(pack?.transparentBreakdown?.tone);
  });

  it("flags the legacy-heavy pack as an act-level transparent risk", () => {
    const pack = getPackById("japan-pop-city-daily-life");

    expect(pack?.transparentBreakdown?.tone).toBe("act");
    expect(pack?.transparentBreakdown?.percent).toBeGreaterThan(
      pack?.transparentBreakdown?.actThreshold ?? 0,
    );
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

  it("still builds previews for planned words that do not have a legacy word id", () => {
    const pack = getPackById("japan-pop-city-daily-life");
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
