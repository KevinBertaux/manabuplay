import { describe, expect, it } from "vitest";
import { buildArchivesBootData, getArchiveDateKeys, getLatestArchiveDateKey } from "../../shared/lib/manabuplay-archives";

describe("buildArchivesBootData", () => {
  it("builds archive mode with one playable archive run", () => {
    const bootData = buildArchivesBootData("2026-04-16");

    expect(bootData.mode).toBe("archives");
    expect(bootData.archive.startDate).toBe("2026-01-01");
    expect(bootData.archive.selectedDate).toBe("2026-04-16");
    expect(bootData.archive.questionCount).toBe(10);
    expect(bootData.difficulties).toHaveLength(1);
    expect(bootData.difficulties[0].id).toBe("archive");
    expect(bootData.quizData).toHaveLength(150);
  });

  it("lists archive dates in descending order down to the start date", () => {
    const reference = new Date("2026-04-17T12:00:00");
    const dates = getArchiveDateKeys(reference);

    expect(getLatestArchiveDateKey(reference)).toBe("2026-04-16");
    expect(dates[0]).toBe("2026-04-16");
    expect(dates[dates.length - 1]).toBe("2026-01-01");
  });
});
