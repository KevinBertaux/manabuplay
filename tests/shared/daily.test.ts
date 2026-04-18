import { describe, expect, it } from "vitest";
import { buildDailyBootData } from "../../shared/lib/manabuplay-daily";

describe("daily boot data", () => {
  it("exposes a single 10-question daily difficulty backed by the v0.1 pack pool", () => {
    const bootData = buildDailyBootData();

    expect(bootData.mode).toBe("daily");
    expect(bootData.daily.questionCount).toBe(10);
    expect(bootData.daily.tierTargets).toEqual({ 1: 4, 2: 3, 3: 2, 4: 1 });
    expect(bootData.difficulties).toEqual([
      expect.objectContaining({
        id: "daily",
        words: 10,
      }),
    ]);
    expect(bootData.quizData).toHaveLength(150);
  });
});
