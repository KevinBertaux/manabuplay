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
    await expect(page.locator(".packs-grid")).toContainText("96/100");
    await expect(page.locator(".packs-grid")).toContainText("96/100");
    await expect(page.locator(".packs-grid")).toContainText("faite · 34/34");
  });

  test("opens a pack detail page with transparency signals and pagination", async ({ page }) => {
    await page.goto(`${PACKS_URL}gacha-and-rewards/`, { waitUntil: "domcontentloaded" });

    await expect(page.locator("[data-reader-cartouche]")).toContainText("Transparence 9% · ok");
    await expect(page.locator("[data-reader-cartouche]")).toContainText(
      "3 pts · 1 strict · 4 éditoriaux · 0 filler",
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

  test("shows reviewed word badges and romaji ids on the JRPG pack", async ({ page }) => {
    await page.goto(`${PACKS_URL}jrpg-questline/`, { waitUntil: "domcontentloaded" });

    await expect(page.locator("[data-reader-cartouche]")).toContainText("faite · 34/34");
    await expect(page.locator('[data-review-status="reviewed"]')).toHaveCount(34);
    await expect(page.locator('[data-review-status="needs-review"]')).toHaveCount(0);
    await expect(page.locator("#word-1")).toContainText("Relu");
    await expect(page.locator("#word-2")).toContainText("Relu");
    await expect(page.locator("#word-14")).toContainText("Objet de quête");
    await expect(page.locator("#word-19 .review-id")).toHaveText("henshin");
    await expect(page.locator("#word-20 .review-id")).toHaveText("irai");
  });

  test("filters the JRPG review cards by status, transparency and tier", async ({ page }) => {
    await page.goto(`${PACKS_URL}jrpg-questline/`, { waitUntil: "domcontentloaded" });

    await page.locator('[data-reader-filter="reviewed"]').click();
    await expect(page.locator(".review-card:visible")).toHaveCount(10);
    await expect(page.locator("[data-page-info]").first()).toContainText("34 visibles");
    await expect(page.locator('[data-review-status="needs-review"]:visible')).toHaveCount(0);

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
