import { describe, expect, it } from "vitest";
import { getRoadmapCatalog } from "../../../apps/admin/src/lib/manabuplay-roadmap";

describe("manabuplay roadmap catalog", () => {
  it("loads the future packs roadmap catalog", () => {
    const catalog = getRoadmapCatalog();

    expect(catalog.version).toBe("v0.x-roadmap");
    expect(catalog.status).toBe("candidate");
    expect(catalog.notes.length).toBeGreaterThan(0);
  });

  it("keeps candidate words and packs aligned", () => {
    const catalog = getRoadmapCatalog();

    expect(catalog.candidateWords.length).toBeGreaterThan(10);
    expect(catalog.packs.length).toBeGreaterThan(0);
    expect(catalog.packs.some((pack) => pack.targetVersion === "v0.2")).toBe(true);
    expect(catalog.packs.every((pack) => pack.candidateWordIds.length > 0)).toBe(true);
  });

  it("retains rejected distractors for later triage", () => {
    const catalog = getRoadmapCatalog();

    expect(catalog.rejectedDistractors.length).toBeGreaterThan(5);
    expect(catalog.rejectedDistractors).toContain("Point de sauvegarde");
  });
});
