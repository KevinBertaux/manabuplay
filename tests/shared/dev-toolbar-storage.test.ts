import { describe, expect, it } from "vitest";
import {
  getArchiveDates,
  resetArchives,
  resetDaily,
  resetPractice,
} from "../../apps/web/src/dev-toolbar/manabuplay-toolbar-storage";

type FakeStorage = Storage & Record<string, string>;

function createStorage(seed: Record<string, string> = {}) {
  const storage = {} as FakeStorage;

  Object.defineProperties(storage, {
    getItem: {
      value(key: string) {
        return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null;
      },
    },
    setItem: {
      value(key: string, value: string) {
        storage[key] = value;
      },
    },
    removeItem: {
      value(key: string) {
        delete storage[key];
      },
    },
  });

  for (const [key, value] of Object.entries(seed)) {
    storage.setItem(key, value);
  }

  return storage;
}

describe("manabuplay dev toolbar storage resets", () => {
  it("resets only today's Daily record", () => {
    const storage = createStorage({
      mp_daily_runs: JSON.stringify({
        "2026-05-04": { dateKey: "2026-05-04", dailyCompletedAt: "2026-05-04T08:00:00.000Z" },
        "2026-05-05": { dateKey: "2026-05-05", dailyCompletedAt: "2026-05-05T08:00:00.000Z" },
      }),
    });

    expect(resetDaily("2026-05-05", storage)).toBe(1);
    expect(JSON.parse(storage.getItem("mp_daily_runs") || "{}")).toEqual({
      "2026-05-04": {
        dateKey: "2026-05-04",
        dailyCompletedAt: "2026-05-04T08:00:00.000Z",
      },
    });
  });

  it("resets all archive records without deleting today's Daily", () => {
    const storage = createStorage({
      "mp_archive_2026-05-03": JSON.stringify({ bestScore: 120 }),
      mp_daily_runs: JSON.stringify({
        "2026-05-03": { dateKey: "2026-05-03", dailyCompletedAt: "2026-05-03T08:00:00.000Z" },
        "2026-05-05": { dateKey: "2026-05-05", dailyCompletedAt: "2026-05-05T08:00:00.000Z" },
      }),
    });

    expect(resetArchives("all", "2026-05-03", "2026-05-05", storage)).toBe(2);
    expect(storage.getItem("mp_archive_2026-05-03")).toBeNull();
    expect(JSON.parse(storage.getItem("mp_daily_runs") || "{}")).toEqual({
      "2026-05-05": {
        dateKey: "2026-05-05",
        dailyCompletedAt: "2026-05-05T08:00:00.000Z",
      },
    });
  });

  it("resets one selected archive date", () => {
    const storage = createStorage({
      mp_daily_runs: JSON.stringify({
        "2026-05-02": { dateKey: "2026-05-02", dailyCompletedAt: "2026-05-02T08:00:00.000Z" },
        "2026-05-03": { dateKey: "2026-05-03", dailyCompletedAt: "2026-05-03T08:00:00.000Z" },
      }),
    });

    expect(resetArchives("date", "2026-05-02", "2026-05-05", storage)).toBe(1);
    expect(JSON.parse(storage.getItem("mp_daily_runs") || "{}")).toEqual({
      "2026-05-03": {
        dateKey: "2026-05-03",
        dailyCompletedAt: "2026-05-03T08:00:00.000Z",
      },
    });
  });

  it("lists archived Daily dates for the reset archive picker", () => {
    const storage = createStorage({
      mp_daily_runs: JSON.stringify({
        "2026-05-02": { dateKey: "2026-05-02", dailyCompletedAt: "2026-05-02T08:00:00.000Z" },
      }),
    });

    expect(getArchiveDates(storage)).toContain("2026-05-02");
  });

  it("resets practice scores and history", () => {
    const storage = createStorage({
      mp_best_easy: "80",
      mp_best_normal: "120",
      mp_practice_sessions: JSON.stringify([{ wordIds: ["a"] }]),
    });

    expect(resetPractice(storage)).toBe(3);
    expect(storage.getItem("mp_best_easy")).toBeNull();
    expect(storage.getItem("mp_best_normal")).toBeNull();
    expect(storage.getItem("mp_practice_sessions")).toBeNull();
  });
});
