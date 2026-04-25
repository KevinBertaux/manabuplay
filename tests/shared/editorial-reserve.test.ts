import { describe, expect, it } from "vitest";
import { getEditorialReserve } from "../../shared/data/manabuplay/editorial-reserve";

describe("editorial reserve", () => {
  it("builds a single editorial inventory from active packs and roadmap candidates", () => {
    const reserve = getEditorialReserve();

    expect(reserve.stats.active).toBe(170);
    expect(reserve.stats.removedFromPack).toBe(14);
    expect(reserve.stats.candidate + reserve.stats.archived + reserve.stats.removedFromPack).toBe(
      42,
    );
    expect(reserve.entries.length).toBe(reserve.stats.total);
    expect(reserve.futurePacks.length).toBeGreaterThan(0);
    expect(reserve.rejectedDistractors.length).toBeGreaterThan(0);
  });

  it("keeps every reserve word sortable by required editorial fields", () => {
    const reserve = getEditorialReserve();

    expect(reserve.stats.needsSorting).toBe(0);
    expect(reserve.entries.every((entry) => entry.jp?.romaji)).toBe(true);
    expect(reserve.entries.every((entry) => entry.gloss.fr && entry.gloss.en)).toBe(true);
    expect(reserve.entries.every((entry) => entry.tier !== null)).toBe(true);
    expect(reserve.entries.every((entry) => typeof entry.transparency.weight === "number")).toBe(
      true,
    );
  });
});
