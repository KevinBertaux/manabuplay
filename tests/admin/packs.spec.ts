import { expect, test } from "@playwright/test";
import { ADMIN_URL } from "./helpers/admin";

const PACKS_URL = `${ADMIN_URL}content/packs/`;

test.describe("admin packs", () => {
  test("lists the current pack set with readiness signals", async ({ page }) => {
    await page.goto(PACKS_URL, { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle(/Lecteur de packs/i);
    await expect(page.locator(".packs-grid")).toBeVisible();
    await expect(page.locator(".pack-card")).toHaveCount(5);
    await expect(page.locator(".packs-grid")).toContainText("JRPG essentiels");
    await expect(page.locator(".packs-grid")).toContainText("Codes d’anime");
    await expect(page.locator(".packs-grid")).toContainText("94/100");
  });

  test("opens a pack detail page with gifts and pagination", async ({ page }) => {
    await page.goto(`${PACKS_URL}japan-pop-city-daily-life/`, { waitUntil: "domcontentloaded" });

    await expect(page.locator("[data-reader-cartouche]")).toContainText("14 cadeaux");
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
