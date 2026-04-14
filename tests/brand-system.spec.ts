import { expect, test, type Page } from "@playwright/test";

const BRAND_SYSTEM_URL = "http://127.0.0.1:4173/docs/brand-system.html";
const STORAGE_KEY = "manabuplay_fx_preset_v1";
const BRAND_PREVIEW_STORAGE_KEY = "manabuplay_fx_brand_preview_enabled_v1";

async function seedPreset(
  page: Page,
  values: Record<string, number>,
  enabled?: Record<string, boolean>,
  brandPreviewEnabled = true,
) {
  await page.addInitScript(
    ({ key, value, brandKey, brandValue }) => {
      window.localStorage.setItem(key, value);
      window.localStorage.setItem(brandKey, brandValue);
    },
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
      brandKey: BRAND_PREVIEW_STORAGE_KEY,
      brandValue: String(brandPreviewEnabled),
    },
  );
}

async function loadBrandSystem(page: Page) {
  await page.goto(BRAND_SYSTEM_URL, { waitUntil: "domcontentloaded" });
  await page.evaluate(
    () =>
      Promise.race([
        document.fonts.ready,
        new Promise((resolve) => window.setTimeout(resolve, 2_000)),
      ]),
  );
  await page.waitForTimeout(150);
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
  test("desktop layout stays contained", async ({ page }) => {
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
    await expect(page.locator("[data-fx-brand-toggle]")).toBeChecked();
    const scanlineOpacity = Number(
      await page.locator("#fx-preview [data-fx-root]").evaluate((node) =>
        getComputedStyle(node, "::before").opacity.trim(),
      ),
    );
    expect(scanlineOpacity).toBeGreaterThan(0.1);
    await page.locator("[data-fx-brand-toggle]").uncheck();
    await expect(page.locator("[data-fx-brand-state]")).toHaveText("FX off");
    await expect
      .poll(() =>
        page.locator("#fx-preview [data-fx-root]").evaluate((node) =>
          Number(getComputedStyle(node, "::before").opacity.trim()),
        ),
      )
      .toBeLessThan(0.01);
    await expect
      .poll(() =>
        page.evaluate((key) => window.localStorage.getItem(key), BRAND_PREVIEW_STORAGE_KEY),
      )
      .toBe("false");
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

  });

  test("mobile layout stays contained", async ({ page }) => {
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
    await expect(page.locator("[data-fx-brand-toggle]")).toBeChecked();
    await expectContained(page, [
      ".hero",
      ".nav",
      "#typography .type",
      "#typography .sample-brand",
      "#fx-preview .fx-stage",
      "#components .quiz",
      "#previews .phone",
    ]);

  });
});
