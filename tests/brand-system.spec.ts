import { expect, test, type Page } from "@playwright/test";

const BRAND_SYSTEM_URL = "http://127.0.0.1:4173/docs/brand-system.html";
const STORAGE_KEY = "manabuplay_fx_preset_v1";

async function seedPreset(page: Page, values: Record<string, number>, enabled?: Record<string, boolean>) {
  await page.addInitScript(
    ({ key, value }) => window.localStorage.setItem(key, value),
    {
      key: STORAGE_KEY,
      value: JSON.stringify({
        values,
        enabled: enabled ?? {
          crt: true,
          scanlines: true,
          noise: true,
          glow: true,
          glitch: true,
          ambient: true,
        },
      }),
    },
  );
}

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
    await seedPreset(page, {
      crt: 100,
      scanlines: 100,
      noise: 54,
      glow: 82,
      glitch: 40,
      ambient: 64,
    });
    await page.setViewportSize({ width: 1440, height: 2200 });
    await loadBrandSystem(page);

    await expectNoHorizontalOverflow(page);
    await expect(page.locator("#fx-preview [data-fx-json]")).toContainText('"glow":82');
    const scanlineOpacity = Number(
      await page.locator("#fx-preview [data-fx-root]").evaluate((node) =>
        getComputedStyle(node).getPropertyValue("--fx-scanline-opacity").trim(),
      ),
    );
    expect(scanlineOpacity).toBeGreaterThan(0.2);
    await expectContained(page, [
      ".hero",
      ".nav",
      "#typography .type",
      "#typography .sample-brand",
      "#fx-preview .fx-stage",
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
    await seedPreset(page, {
      crt: 72,
      scanlines: 64,
      noise: 38,
      glow: 62,
      glitch: 28,
      ambient: 48,
    });
    await page.setViewportSize({ width: 390, height: 1600 });
    await loadBrandSystem(page);

    await expectNoHorizontalOverflow(page);
    await expectContained(page, [
      ".hero",
      ".nav",
      "#typography .type",
      "#typography .sample-brand",
      "#fx-preview .fx-stage",
      "#components .quiz",
      "#previews .phone",
    ]);

    await page.screenshot({
      path: testInfo.outputPath("brand-system-mobile.png"),
      fullPage: true,
    });
  });
});
