import { expect, test } from "@playwright/test";
import { ADMIN_URL } from "./helpers/admin";

const ARCH_URL = `${ADMIN_URL}pilotage/architecture/`;

test.describe("admin architecture plan", () => {
  test("renders the HUD and switches language", async ({ page }) => {
    await page.goto(ARCH_URL, { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle(/Architecture Plan/i);
    await expect(page.locator(".arch-hud")).toBeVisible();
    await expect(page.locator(".arch-summary-bar")).toHaveCount(2);
    await expect(page.locator(".arch-table tbody tr")).toHaveCount(14);

    await page.locator("[data-admin-lang='fr']").click();
    await expect(page.locator(".arch-summary-bar").first()).toContainText("1. Priorités produit");

    await page.locator("[data-admin-lang='en']").click();
    await expect(page.locator(".arch-summary-bar").first()).toContainText("1. Product priorities");
    await expect(page.locator(".arch-phase")).toHaveCount(6);
  });
});
