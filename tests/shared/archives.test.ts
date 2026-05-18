import { describe, expect, it } from "vitest";
import {
  buildArchivesBootData,
  getArchiveDateKeys,
  getLatestArchiveDateKey,
  getArchiveMonthGroups,
} from "../../shared/lib/manabuplay-archives";

describe("buildArchivesBootData", () => {
  it("builds archive mode with one playable archive run", () => {
    const bootData = buildArchivesBootData("2026-04-16");

    expect(bootData.mode).toBe("archives");
    expect(bootData.archive.startDate).toBe("2026-01-01");
    expect(bootData.archive.selectedDate).toBe("2026-04-16");
    expect(bootData.archive.questionCount).toBe(10);
    expect(bootData.difficulties).toHaveLength(1);
    expect(bootData.difficulties[0].id).toBe("archive");
    expect(bootData.quizData).toHaveLength(170);
  });

  it("lists archive dates in descending order down to the start date", () => {
    const reference = new Date("2026-04-17T12:00:00");
    const dates = getArchiveDateKeys(reference);

    expect(getLatestArchiveDateKey(reference)).toBe("2026-04-16");
    expect(dates[0]).toBe("2026-04-16");
    expect(dates[dates.length - 1]).toBe("2026-01-01");
  });

  it("builds localized monthly calendar groups with future days disabled", () => {
    const groups = getArchiveMonthGroups({
      locale: "fr",
      selectedDate: "2026-05-04",
      referenceDate: new Date("2026-05-05T12:00:00"),
    });
    const may = groups[0];

    expect(may.key).toBe("2026-05");
    expect(may.open).toBe(true);
    expect(may.weekdays[0]).toMatch(/lun/i);
    expect(may.cells.find((cell) => cell.dateKey === "2026-05-04")).toMatchObject({
      tone: "archive",
      href: "/fr/archives/?date=2026-05-04",
      isSelected: true,
    });
    expect(may.cells.find((cell) => cell.dateKey === "2026-05-05")).toMatchObject({
      tone: "today",
      disabled: true,
    });
    expect(may.cells.find((cell) => cell.dateKey === "2026-05-06")).toMatchObject({
      tone: "future",
      disabled: true,
    });
  });
});
