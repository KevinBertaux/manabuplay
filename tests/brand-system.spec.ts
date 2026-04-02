import { expect, test, type Page } from "@playwright/test";

const BRAND_SYSTEM_URL = "http://127.0.0.1:4173/docs/brand-system.html";

async function loadBrandSystem(page: Page) {
  await page.goto(BRAND_SYSTEM_URL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveTitle(/ManabuPlay Brand System/);
}

async function expectNoHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    return {
      clientWidth: doc.clientWidth,
      scrollWidth: doc.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
    };
  });

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
  expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

async function expectContained(page: Page, selectors: string[]) {
  const issues = await page.evaluate((localSelectors) => {
    const viewportWidth = document.documentElement.clientWidth;
    const results: string[] = [];

    for (const selector of localSelectors) {
      document.querySelectorAll<HTMLElement>(selector).forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        const parentRect = element.parentElement?.getBoundingClientRect() ?? null;

        if (rect.right > viewportWidth + 1) {
          results.push(`${selector}[${index}] exceeds viewport`);
        }

        if (parentRect && rect.right > parentRect.right + 1) {
          results.push(`${selector}[${index}] exceeds parent`);
        }
      });
    }

    return results;
  }, selectors);

  expect(issues).toEqual([]);
}

test.describe("brand system document", () => {
  test("desktop layout stays contained", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 2200 });
    await loadBrandSystem(page);

    await expectNoHorizontalOverflow(page);
    await expectContained(page, [
      ".hero",
      ".nav",
      "#typography .type",
      "#typography .sample-brand",
      "#tokens .card",
      "#previews .frame",
      "#previews .phone",
    ]);

    await page.screenshot({
      path: testInfo.outputPath("brand-system-desktop.png"),
      fullPage: true,
    });
  });

  test("mobile layout stays contained", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 1600 });
    await loadBrandSystem(page);

    await expectNoHorizontalOverflow(page);
    await expectContained(page, [
      ".hero",
      ".nav",
      "#typography .type",
      "#typography .sample-brand",
      "#components .quiz",
      "#previews .phone",
    ]);

    await page.screenshot({
      path: testInfo.outputPath("brand-system-mobile.png"),
      fullPage: true,
    });
  });
});
