import { describe, expect, it } from "vitest";
import { getRoadmapCatalog } from "../../../apps/admin/src/lib/manabuplay-roadmap";

describe("manabuplay roadmap catalog", () => {
  it("loads the reserve-backed future pack catalog", () => {
    const catalog = getRoadmapCatalog();

    expect(catalog.version).toBe("v0.1");
    expect(catalog.status).toBe("editorial-reserve");
    expect(catalog.notes.length).toBeGreaterThan(0);
  });

  it("keeps candidate words and packs aligned", () => {
    const catalog = getRoadmapCatalog();

    expect(catalog.candidateWords.length).toBe(96);
    expect(catalog.packs.length).toBeGreaterThan(0);
    expect(catalog.packs.some((pack) => pack.targetVersion === "v0.2")).toBe(true);
    expect(catalog.packs.every((pack) => pack.candidateWordIds.length > 0)).toBe(true);
  });

  it("retains rejected distractors for later triage", () => {
    const catalog = getRoadmapCatalog();

    expect(catalog.rejectedDistractors).toHaveLength(21);
    expect(catalog.rejectedDistractors).toContain("Point de sauvegarde");
  });
});
