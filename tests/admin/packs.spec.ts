import { expect, test } from "@playwright/test";
import { ADMIN_URL } from "./helpers/admin";

const PACKS_URL = `${ADMIN_URL}content/packs/`;

test.describe("admin packs", () => {
  test("lists the current pack set with readiness signals", async ({ page }) => {
    await page.goto(PACKS_URL, { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle(/Lecteur de packs/i);
    await expect(page.locator(".packs-grid")).toBeVisible();
    await expect(page.locator(".pack-card")).toHaveCount(5);
    await expect(page.locator(".packs-grid")).toContainText("JRPG Questline");
    await expect(page.locator(".packs-grid")).toContainText("Anime Codes");
    await expect(page.locator(".packs-grid")).toContainText("Gacha & Rewards");
    await expect(page.locator(".packs-grid")).toContainText("92/100");
    await expect(page.locator(".packs-grid")).toContainText("partielle · 30/34");
  });

  test("opens a pack detail page with transparency signals and pagination", async ({ page }) => {
    await page.goto(`${PACKS_URL}gacha-live-service/`, { waitUntil: "domcontentloaded" });

    await expect(page.locator("[data-reader-cartouche]")).toContainText("Transparence 16% · watch");
    await expect(page.locator("[data-reader-cartouche]")).toContainText(
      "5.5 pts · 1 strict · 9 éditoriaux · 0 filler",
    );
    await expect(page.locator("[data-admin-card]").first()).toBeVisible();

    await page.locator("[data-toggle-gifts]").click();
    await expect(page.locator("[data-gift-list]")).toBeVisible();

    const firstCard = page.locator("[data-admin-card]").first();
    await firstCard.locator("[data-toggle-card]").click();
    await expect(firstCard).toHaveAttribute("data-state", "pristine");

    await page.locator("[data-page-next]").first().click();
    await expect(page.locator("[data-page-info]").first()).not.toHaveText("");
  });
});
