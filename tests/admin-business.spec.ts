import { expect, test, type Page } from "@playwright/test";
import { ASTRO_URL } from "./helpers/visual";

const ADMIN_URL = `${ASTRO_URL}admin/`;
const BUSINESS_URL = `${ASTRO_URL}admin/business-models/`;

async function openBusinessPage(page: Page) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await page.goto(BUSINESS_URL, { waitUntil: "domcontentloaded" });
    const title = await page.title();
    if (!/Error response/i.test(title)) {
      await page.waitForURL(/\/admin\/business-models\/$/);
      if (await page.locator(".biz-pricing-table").count()) {
        return;
      }
    }

    await page.goto(ADMIN_URL, { waitUntil: "domcontentloaded" });
    if (await page.locator(".admin-grid").count()) {
      await page.locator(".admin-grid a[href='/admin/business-models']").click();
      await page.waitForURL(/\/admin\/business-models\/$/);
      if (await page.locator(".biz-pricing-table").count()) {
        return;
      }
    }

    if (attempt < 4) {
      await page.waitForTimeout(1000);
    }
  }
  throw new Error("Admin hub did not become available after retries.");
}

test.describe("admin business models", () => {
  test("shows the retained premium-library model and the future free-premium split", async ({ page }) => {
    await openBusinessPage(page);

    await expect(page).toHaveTitle(/Business Models/i);
    await page.locator("[data-admin-lang='fr']").evaluate((node) => {
      (node as HTMLButtonElement).click();
    });
    await expect(page.locator(".biz-title")).toContainText("Modele retenu");
    await expect(page.locator(".biz-model-title")).toContainText("Bibliotheque premium");
    await expect(page.locator(".biz-pricing-title")).toContainText("Projection Free / Premium");
    await expect(page.locator(".biz-pricing-table")).toContainText("30 jours");
    await expect(page.locator(".biz-pricing-table")).toContainText("170 + bibliothèque complète");
  });

  test("switches the page copy to english", async ({ page }) => {
    await openBusinessPage(page);
    await expect(page.locator(".biz-pricing-table")).toBeVisible();

    await page.locator("[data-admin-lang='fr']").evaluate((node) => {
      (node as HTMLButtonElement).click();
    });
    await expect(page.locator(".biz-title")).toContainText("Modele retenu");
    await expect(page.locator(".biz-pricing-table")).toContainText("contenu, profondeur, confort");

    await page.locator("[data-admin-lang='en']").evaluate((node) => {
      (node as HTMLButtonElement).click();
    });

    await expect(page.locator(".biz-title")).toContainText("Selected model");
    await expect(page.locator(".biz-model-title")).toContainText("Premium library");
    await expect(page.locator(".biz-pricing-title")).toContainText("Free / Premium projection");
    await expect(page.locator(".biz-pricing-table")).toContainText("170 + full library");
  });
});
