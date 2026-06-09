import { expect, test, type Page } from "@playwright/test";
import { ASTRO_HOME_URL, preparePage } from "../helpers/visual";

async function loadHome(page: Page) {
  await preparePage(page, ASTRO_HOME_URL);
  await expect(page).toHaveTitle(/ManabuPlay/i);
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

test.describe("home layout", () => {
  test("desktop shell stays contained", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 2200 });
    await loadHome(page);

    await expectNoHorizontalOverflow(page);
    await expectContained(page, [
      "nav",
      ".public-top-nav-inner",
      ".public-mode-nav-segmented",
      "section.hero-bg",
      "#features",
      "#notify form",
      "footer",
      ".public-site-footer-inner",
    ]);
  });

  test("mobile shell stays contained", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1600 });
    await loadHome(page);

    await expectNoHorizontalOverflow(page);
    await expectContained(page, [
      "nav",
      ".public-top-nav-inner",
      "#public-mode-menu-trigger",
      "section.hero-bg",
      "#features",
      "#notify form",
      "footer",
      ".public-site-footer-inner",
    ]);
  });
});
