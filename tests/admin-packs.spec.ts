import { expect, test } from "@playwright/test";
import { ASTRO_URL } from "./helpers/visual";

const PACKS_URL = `${ASTRO_URL}admin/packs`;

test.describe("admin packs", () => {
  test("lists the current pack set with readiness signals", async ({ page }) => {
    await page.goto(PACKS_URL, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Lecteur de packs/i);
    await expect(page.locator(".packs-grid")).toBeVisible();

    await expect(page.locator(".pack-card")).toHaveCount(5);
    await expect(page.locator(".packs-grid")).toContainText("JRPG essentiels");
    await expect(page.locator(".packs-grid")).toContainText("Codes d’anime");
    await expect(page.locator(".packs-grid")).toContainText("94/100");
    await expect(page.locator(".packs-grid")).toContainText("92/100");
  });

  test("opens a pack detail page with gifts, pagination, and card toggles", async ({ page }) => {
    await page.goto(`${PACKS_URL}/japan-pop-city-daily-life`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-reader-cartouche]")).toContainText("14 cadeaux");
    expect(await page.locator("[data-admin-card]").count()).toBeGreaterThan(0);

    await page.locator("[data-toggle-gifts]").evaluate((node) => {
      (node as HTMLButtonElement).click();
    });
    await expect(page.locator("[data-gift-list]")).toBeVisible();
    expect(await page.locator("[data-gift-word]").count()).toBeGreaterThan(5);

    const firstCard = page.locator("[data-admin-card]").first();
    await expect(firstCard).toHaveAttribute("data-state", "revealed");
    await firstCard.locator("[data-toggle-card]").evaluate((node) => {
      (node as HTMLButtonElement).click();
    });
    await expect(firstCard).toHaveAttribute("data-state", "pristine");

    await page.locator("[data-page-next]").first().evaluate((node) => {
      (node as HTMLButtonElement).click();
    });
    await expect(page.locator("[data-page-info]").first()).not.toHaveText("");
  });
});
