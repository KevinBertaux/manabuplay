import { expect, test } from "@playwright/test";
import { ADMIN_URL } from "./helpers/admin";

const BUSINESS_URL = `${ADMIN_URL}pilotage/business/`;

test.describe("admin business models", () => {
  test("shows the retained premium-library model", async ({ page }) => {
    await page.goto(BUSINESS_URL, { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle(/Business Models/i);
    await expect(page.locator(".biz-pricing-table")).toBeVisible();

    await page.locator("[data-admin-lang='fr']").click();
    await expect(page.locator(".biz-title")).toContainText("Modele retenu");
    await expect(page.locator(".biz-model-title")).toContainText("Bibliotheque premium");
    await expect(page.locator(".biz-pricing-table")).toContainText("30 jours");

    await page.locator("[data-admin-lang='en']").click();
    await expect(page.locator(".biz-title")).toContainText("Selected model");
    await expect(page.locator(".biz-model-title")).toContainText("Premium library");
    await expect(page.locator(".biz-pricing-table")).toContainText("170 + full library");
  });
});
