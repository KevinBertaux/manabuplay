import { describe, expect, it } from "vitest";
import { getEditorialReserve } from "../../shared/data/manabuplay/editorial-reserve";

describe("editorial reserve", () => {
  it("builds a single editorial inventory from active packs and reserve words", () => {
    const reserve = getEditorialReserve();

    expect(reserve.stats.active).toBe(170);
    expect(reserve.stats.candidate).toBe(24);
    expect(reserve.stats.seedLegacy).toBe(4);
    expect(reserve.stats.removedFromPack).toBe(18);
    expect(reserve.stats.retiredPackSource).toBe(30);
    expect(reserve.stats.toWrite).toBe(20);
    expect(
      reserve.stats.candidate +
        reserve.stats.seedLegacy +
        reserve.stats.removedFromPack +
        reserve.stats.retiredPackSource +
        reserve.stats.toWrite,
    ).toBe(96);
    expect(
      new Set(reserve.entries.filter((entry) => entry.status !== "active").map((entry) => entry.id))
        .size,
    ).toBe(96);
    expect(
      reserve.entries
        .filter((entry) => entry.status !== "active")
        .flatMap((entry) => entry.sources || []).length,
    ).toBeGreaterThan(96);
    expect(reserve.entries.length).toBe(reserve.stats.total);
    expect(reserve.futurePacks.length).toBeGreaterThan(0);
    expect(reserve.rejectedDistractors).toHaveLength(21);
  });

  it("keeps complete reserve words sortable and marks incomplete words explicitly", () => {
    const reserve = getEditorialReserve();
    const completeReserveWords = reserve.entries.filter(
      (entry) => entry.status !== "active" && entry.status !== "to-write",
    );

    expect(reserve.stats.needsSorting).toBe(20);
    expect(completeReserveWords.every((entry) => entry.jp?.romaji)).toBe(true);
    expect(completeReserveWords.every((entry) => entry.gloss.fr && entry.gloss.en)).toBe(true);
    expect(completeReserveWords.every((entry) => entry.tier !== null)).toBe(true);
    expect(reserve.entries.filter((entry) => entry.status === "to-write")).toHaveLength(20);
  });

  it("keeps every reserve entry transparency explicit", () => {
    const reserve = getEditorialReserve();

    expect(reserve.entries.every((entry) => typeof entry.transparency.weight === "number")).toBe(
      true,
    );
  });
});
