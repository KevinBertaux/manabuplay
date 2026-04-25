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
    await expect(page.locator(".packs-grid")).toContainText("84/100");
    await expect(page.locator(".packs-grid")).toContainText("96/100");
    await expect(page.locator(".packs-grid")).toContainText("70/100");
    await expect(page.locator(".packs-grid")).toContainText("partielle · 16/34");
    await expect(page.locator(".packs-grid")).toContainText("partielle · 30/34");
  });

  test("opens a pack detail page with transparency signals and pagination", async ({ page }) => {
    await page.goto(`${PACKS_URL}gacha-and-rewards/`, { waitUntil: "domcontentloaded" });

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

  test("shows reviewed and needs-review word badges on the JRPG pack", async ({ page }) => {
    await page.goto(`${PACKS_URL}jrpg-questline/`, { waitUntil: "domcontentloaded" });

    await expect(page.locator('[data-review-status="reviewed"]')).toHaveCount(16);
    await expect(page.locator('[data-review-status="needs-review"]')).toHaveCount(18);
    await expect(page.locator("#word-1")).toContainText("À relire");
    await expect(page.locator("#word-2")).toContainText("Relu");
  });

  test("filters the JRPG review cards by status, transparency and tier", async ({ page }) => {
    await page.goto(`${PACKS_URL}jrpg-questline/`, { waitUntil: "domcontentloaded" });

    await page.locator('[data-reader-filter="needs-review"]').click();
    await expect(page.locator(".review-card:visible")).toHaveCount(10);
    await expect(page.locator("[data-page-info]").first()).toContainText("18 visibles");
    await expect(page.locator('[data-review-status="reviewed"]:visible')).toHaveCount(0);

    await page.locator('[data-reader-filter="transparent"]').click();
    await expect(page.locator(".review-card:visible")).toHaveCount(7);
    await expect(page.locator("[data-page-info]").first()).toContainText("7 visibles");
    await expect(page.locator('[data-transparency-level="none"]:visible')).toHaveCount(0);

    await page.locator('[data-reader-filter="tier-4"]').click();
    await expect(page.locator(".review-card:visible")).toHaveCount(5);
    await expect(page.locator("[data-page-info]").first()).toContainText("5 visibles");
    await expect(page.locator('[data-tier="4"]:visible')).toHaveCount(5);
  });
});
