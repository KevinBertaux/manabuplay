import { describe, expect, it } from "vitest";
import {
  ADMIN_GROUPS,
  ADMIN_PRIMARY_ITEMS,
  isAdminNavGroupActive,
  isAdminNavItemActive,
} from "../../../apps/admin/src/lib/admin-nav";

describe("admin nav", () => {
  it("exposes the primary admin routes", () => {
    expect(ADMIN_PRIMARY_ITEMS.map((item) => item.label)).toEqual(["Accueil"]);
    expect(ADMIN_PRIMARY_ITEMS.find((item) => item.key === "hub")?.href).toBe("/");
  });

  it("keeps pilotage routes under the pilotage drawer", () => {
    const pilotageGroup = ADMIN_GROUPS.find((group) => group.label === "Pilotage");

    expect(pilotageGroup).toBeDefined();
    expect(pilotageGroup?.items.map((item) => item.label)).toEqual([
      "Backlog",
      "Architecture",
      "Business",
      "Wording",
      "Guide",
    ]);
    expect(pilotageGroup?.items.find((item) => item.key === "architecture")?.href).toBe(
      "/pilotage/architecture",
    );
  });

  it("marks active drawer items without affecting siblings", () => {
    const pilotageGroup = ADMIN_GROUPS.find((group) => group.label === "Pilotage");
    const architecture = pilotageGroup?.items.find((item) => item.key === "architecture");
    const backlog = pilotageGroup?.items.find((item) => item.key === "backlog");

    expect(architecture).toBeDefined();
    expect(backlog).toBeDefined();
    expect(isAdminNavItemActive(architecture!, "architecture")).toBe(true);
    expect(isAdminNavItemActive(backlog!, "architecture")).toBe(false);
  });

  it("keeps grouped design routes under the right drawers", () => {
    const designGroup = ADMIN_GROUPS.find((group) => group.label === "Design");

    expect(designGroup?.items.map((item) => item.label)).toEqual([
      "Charte",
      "FX",
      "Mockups",
      "Références",
    ]);
    expect(designGroup?.items.find((item) => item.label === "Mockups")?.activeKey).toBe("mockups");
    expect(designGroup?.items.find((item) => item.label === "Références")?.activeKey).toBe(
      "references",
    );
  });

  it("opens only the drawer matching the current section", () => {
    const designGroup = ADMIN_GROUPS.find((group) => group.label === "Design");
    const contentGroup = ADMIN_GROUPS.find((group) => group.label === "Contenu");

    expect(designGroup).toBeDefined();
    expect(contentGroup).toBeDefined();
    expect(isAdminNavGroupActive(designGroup!, "mockups")).toBe(true);
    expect(isAdminNavGroupActive(contentGroup!, "mockups")).toBe(false);
  });
});
