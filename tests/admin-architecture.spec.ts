import { expect, test } from "@playwright/test";
import { ASTRO_URL } from "./helpers/visual";

const ARCH_URL = `${ASTRO_URL}admin/architecture-plan`;

test.describe("admin architecture plan", () => {
  test("renders the HUD and implementation phases", async ({ page }) => {
    await page.goto(ARCH_URL, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Architecture Plan/i);
    await expect(page.locator(".arch-hud")).toBeVisible();

    await page.locator("[data-admin-lang='fr']").evaluate((node) => {
      (node as HTMLButtonElement).click();
    });

    await expect(page.locator(".arch-hud .arch-summary-bar")).toHaveCount(2);
    await expect(page.locator(".arch-summary-bar").first()).toContainText("1. Priorités produit");
    await expect(page.locator(".arch-summary-bar").nth(1)).toContainText("2. Nouvelle architecture");
    await expect(page.locator(".arch-progress-percent")).toContainText(["12%", "10%"]);

    await expect(page.locator(".arch-table tbody tr")).toHaveCount(14);
    await expect(page.locator(".arch-phase")).toHaveCount(6);
    expect(await page.locator(".arch-file-row").count()).toBeGreaterThan(10);
  });

  test("switches admin copy to english", async ({ page }) => {
    await page.goto(ARCH_URL, { waitUntil: "domcontentloaded" });
    await expect(page.locator(".arch-hud")).toBeVisible();

    await page.locator("[data-admin-lang='fr']").evaluate((node) => {
      (node as HTMLButtonElement).click();
    });
    await expect(page.locator(".arch-summary-bar").first()).toContainText("1. Priorités produit");

    await page.locator("[data-admin-lang='en']").evaluate((node) => {
      (node as HTMLButtonElement).click();
    });

    await expect(page.locator(".arch-summary-bar").first()).toContainText("1. Product priorities");
    await expect(page.locator(".arch-summary-bar").nth(1)).toContainText("2. New architecture");
    await expect(page.locator(".arch-section-title").first()).toHaveText("1. Product priorities");
  });
});
