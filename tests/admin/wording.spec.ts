import { expect, test } from "@playwright/test";
import { ADMIN_URL } from "./helpers/admin";

const WORDING_URL = `${ADMIN_URL}copy/landing/`;

test.describe("admin landing wording", () => {
  test("shows the validated hero copy in french and english", async ({ page }) => {
    await page.goto(WORDING_URL, { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle(/Landing Wording/i);
    await expect(page.locator(".wording-grid")).toBeVisible();

    await page.locator("[data-admin-lang='fr']").click();
    await page.locator(".wording-card-summary").filter({ hasText: /Hero badge|Badge hero/ }).first().click();
    await expect(page.locator(".wording-card").filter({ hasText: /Hero badge|Badge hero/ }).first()).toContainText(
      "Quiz quotidien · Sans inscription · Mode entraînement · 4 difficultés",
    );

    await page.locator("[data-admin-lang='en']").click();
    await expect(page.locator(".wording-title")).toContainText("Lot 1");
    await expect(page.locator(".wording-title")).toContainText("SEO, nav and hero");
    await expect(page.locator(".wording-card").filter({ hasText: /Hero tagline|Tagline hero/ }).first()).toContainText(
      "Learn Japanese vocabulary through gaming and pop culture.",
    );
  });
});
