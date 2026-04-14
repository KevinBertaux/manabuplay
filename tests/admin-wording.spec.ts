import { expect, test } from "@playwright/test";
import { ASTRO_URL } from "./helpers/visual";

const WORDING_URL = `${ASTRO_URL}admin/landing-wording`;

test.describe("admin landing wording", () => {
  test("shows completed lot 1 and validated hero copy", async ({ page }) => {
    await page.goto(WORDING_URL, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Landing Wording/i);
    await expect(page.locator(".wording-grid")).toBeVisible();

    await page.locator("[data-admin-lang='fr']").evaluate((node) => {
      (node as HTMLButtonElement).click();
    });

    await expect(page.locator(".wording-summary")).toContainText(/blocs validés|validated blocks/i);
    await page.locator(".wording-card-summary").filter({ hasText: /Hero badge|Badge hero/ }).first().evaluate((node) => {
      (node as HTMLElement).click();
    });

    await expect(page.locator(".wording-card").filter({ hasText: /Hero badge|Badge hero/ }).first()).toContainText(
      "Quiz quotidien · Sans inscription · Mode entraînement · 4 difficultés",
    );
    await expect(page.locator(".wording-card").filter({ hasText: /Hero tagline|Tagline hero/ }).first()).toContainText(
      "Apprends du vocabulaire japonais à travers le jeu vidéo et la pop culture.",
    );
    expect(await page.locator(".wording-status.done").count()).toBeGreaterThan(3);
  });

  test("switches wording page copy to english", async ({ page }) => {
    await page.goto(WORDING_URL, { waitUntil: "domcontentloaded" });
    await expect(page.locator(".wording-grid")).toBeVisible();

    await page.locator("[data-admin-lang='fr']").evaluate((node) => {
      (node as HTMLButtonElement).click();
    });
    await expect(page.locator(".wording-group-title").first()).toHaveText("Head");

    await page.locator("[data-admin-lang='en']").evaluate((node) => {
      (node as HTMLButtonElement).click();
    });

    await expect(page.locator(".wording-title")).toContainText("Lot 1");
    await expect(page.locator(".wording-title")).toContainText("SEO, nav and hero");
    await expect(page.locator(".wording-group-title").first()).toHaveText("Head");
  });
});
