import { describe, expect, it } from "vitest";
import { buildPracticeBootData } from "../../shared/lib/manabuplay-practice";

describe("practice boot data", () => {
  it("exposes the four framed arcade recipes and cooldown settings", () => {
    const bootData = buildPracticeBootData();

    expect(bootData.mode).toBe("arcade");
    expect(bootData.practice.questionCount).toBe(10);
    expect(bootData.practice.cooldownSessions).toBe(2);
    expect(bootData.practice.recipes).toEqual({
      easy: { 1: 6, 2: 3, 3: 1, 4: 0 },
      normal: { 1: 4, 2: 3, 3: 2, 4: 1 },
      hard: { 1: 2, 2: 3, 3: 3, 4: 2 },
      expert: { 1: 1, 2: 1, 3: 4, 4: 4 },
    });
    expect(bootData.difficulties).toHaveLength(4);
    expect(bootData.quizData).toHaveLength(170);
  });
});
