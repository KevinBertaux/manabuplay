import { expect, test, type Page } from "@playwright/test";
import { ADMIN_URL } from "../helpers/admin";

const BRAND_SYSTEM_URL = `${ADMIN_URL}design/brand-system/`;

async function getOverflowMetrics(page: Page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return {
      clientWidth: doc.clientWidth,
      scrollWidth: doc.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
    };
  });
}

test.describe("brand system document", () => {
  test("desktop view stays contained", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 2200 });
    await page.goto(BRAND_SYSTEM_URL, { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle(/ManabuPlay Brand System/);
    await expect(page.locator("#components")).toBeVisible();

    const metrics = await getOverflowMetrics(page);
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
    expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
  });

  test("mobile view stays contained", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1600 });
    await page.goto(BRAND_SYSTEM_URL, { waitUntil: "domcontentloaded" });

    await expect(page.locator(".hero")).toBeVisible();
    await expect(page.locator("#typography")).toBeVisible();

    const metrics = await getOverflowMetrics(page);
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
    expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
  });
});
