import { describe, expect, it } from "vitest";
import {
  ADMIN_GROUPS,
  ADMIN_PRIMARY_ITEMS,
  isAdminNavGroupActive,
  isAdminNavItemActive,
} from "../../../apps/admin/src/lib/admin-nav";

describe("admin nav", () => {
  it("exposes the primary admin routes", () => {
    expect(ADMIN_PRIMARY_ITEMS.map((item) => item.label)).toEqual([
      "Accueil",
      "Backlog",
      "Architecture",
      "Business",
      "Wording",
      "Guide",
    ]);
    expect(ADMIN_PRIMARY_ITEMS.find((item) => item.key === "architecture")?.href).toBe(
      "/pilotage/architecture",
    );
  });

  it("marks active primary items without affecting siblings", () => {
    const architecture = ADMIN_PRIMARY_ITEMS.find((item) => item.key === "architecture");
    const backlog = ADMIN_PRIMARY_ITEMS.find((item) => item.key === "backlog");

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
