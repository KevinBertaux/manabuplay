import { describe, expect, it } from "vitest";
import { buildCatalogQuizData } from "../../shared/data/manabuplay/catalog";
import {
  buildDailyQuizData,
  getSessionDateKey,
  resolveQuizDataset,
} from "../../shared/lib/quiz-dataset";

const dailyConfig = {
  questionCount: 10,
  startDate: "2026-01-01",
  wordCooldownDays: 7,
  packCooldownDays: 1,
  tierTargets: { 1: 4, 2: 3, 3: 2, 4: 1 },
};

const archiveBoot = {
  mode: "archives",
  daily: dailyConfig,
  archive: {
    selectedDate: "2026-04-16",
    startDate: "2026-04-01",
    latestDate: "2026-04-17",
  },
};

describe("resolveQuizDataset", () => {
  const pool = buildCatalogQuizData();

  it("returns the full pool for arcade mode", () => {
    const resolved = resolveQuizDataset({
      mode: "arcade",
      pool,
      boot: { mode: "arcade" },
      locale: "fr",
    });

    expect(resolved.rawQuizData).toBe(pool);
    expect(resolved.quizData).toBe(pool);
    expect(resolved.quizData).toHaveLength(pool.length);
    expect(resolved.locale).toBe("fr");
  });

  it("builds a deterministic 10-question daily run from the embedded pool", () => {
    const resolved = resolveQuizDataset({
      mode: "daily",
      pool,
      boot: { mode: "daily", daily: dailyConfig },
      locale: "en",
      now: new Date("2026-05-05T09:00:00"),
    });

    expect(resolved.sessionDateKey).toBe("2026-05-05");
    expect(resolved.quizData).toHaveLength(10);
    expect(resolved.quizData).toEqual(
      buildDailyQuizData({
        pool,
        dateKey: "2026-05-05",
        dailyConfig,
      }),
    );
  });

  it("uses the archive query date when present", () => {
    const resolved = resolveQuizDataset({
      mode: "archives",
      pool,
      boot: archiveBoot,
      locale: "fr",
      search: "?date=2026-04-17",
    });

    expect(resolved.sessionDateKey).toBe("2026-04-17");
    expect(resolved.quizData).toHaveLength(10);
    expect(resolved.quizData).toEqual(
      buildDailyQuizData({
        pool,
        dateKey: "2026-04-17",
        dailyConfig,
      }),
    );
  });

  it("falls back to the configured archive date when the query is invalid", () => {
    expect(
      getSessionDateKey({
        mode: "archives",
        archiveConfig: archiveBoot.archive,
        search: "?date=not-a-date",
      }),
    ).toBe("2026-04-16");

    const resolved = resolveQuizDataset({
      mode: "archives",
      pool,
      boot: archiveBoot,
      locale: "fr",
      search: "?date=2099-01-01",
    });

    expect(resolved.sessionDateKey).toBe("2026-04-16");
  });

  it("honours an explicit dateKey override for archive replays", () => {
    const resolved = resolveQuizDataset({
      mode: "archives",
      pool,
      boot: archiveBoot,
      locale: "fr",
      search: "?date=2026-04-17",
      dateKey: "2026-04-16",
    });

    expect(resolved.sessionDateKey).toBe("2026-04-16");
    expect(resolved.quizData.map((entry) => entry.id)).toEqual(
      buildDailyQuizData({
        pool,
        dateKey: "2026-04-16",
        dailyConfig,
      }).map((entry) => entry.id),
    );
  });
});
