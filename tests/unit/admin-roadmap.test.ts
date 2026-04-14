import { describe, expect, it } from "vitest";
import {
  getRoadmapData,
  getRoadmapLabelMap,
  getRoadmapVersion,
  getRoadmapVersionSummaries,
} from "../../src/lib/admin-roadmap";

describe("admin roadmap", () => {
  it("loads the roadmap data from docs", () => {
    const roadmap = getRoadmapData();

    expect(roadmap.meta.title).toBe("ManabuPlay Roadmap");
    expect(roadmap.meta.defaultVersionId).toBe("v0.1");
    expect(roadmap.versions.length).toBeGreaterThan(3);
  });

  it("returns a version by id and null for unknown ids", () => {
    expect(getRoadmapVersion("v0.1")?.label).toBe("v0.1");
    expect(getRoadmapVersion("does-not-exist")).toBeNull();
  });

  it("builds summaries with parent and child counts", () => {
    const summaries = getRoadmapVersionSummaries();
    const v01 = summaries.find((entry) => entry.id === "v0.1");

    expect(v01).toBeTruthy();
    expect(v01?.total).toBeGreaterThan(10);
    expect(v01?.done).toBeGreaterThan(0);
    expect(v01?.childTotal).toBeGreaterThan(0);
    expect(v01?.childDone).toBeGreaterThan(0);
  });

  it("builds label maps for roadmap metadata", () => {
    const labels = getRoadmapLabelMap();

    expect(labels.priority.P0).toBe("P0");
    expect(labels.area.landing).toBe("Landing");
    expect(labels.type.infra).toBe("Infra");
    expect(labels.status.done).toBe("Fait");
  });
});
