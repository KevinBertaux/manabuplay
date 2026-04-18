import { expect, test, type Page } from "@playwright/test";
import { ADMIN_URL } from "../helpers/admin";

const BRAND_SYSTEM_URL = `${ADMIN_URL}design/brand-system/`;
const STORAGE_KEY = "manabuplay_fx_preset_v1";
const BRAND_PREVIEW_STORAGE_KEY = "manabuplay_fx_brand_preview_enabled_v1";

type FxPresetValues = {
  crt: number;
  scanlines: number;
  noise: number;
  glow: number;
  glitch: number;
  ambient: number;
};

type FxPresetEnabled = Partial<Record<keyof FxPresetValues, boolean>>;

type BrandSeedPayload = {
  key: string;
  value: string;
  brandKey: string;
  brandValue: string;
};

async function seedPreset(
  page: Page,
  values: FxPresetValues,
  enabled?: FxPresetEnabled,
  brandPreviewEnabled = true,
) {
  await page.addInitScript(
    ({ key, value, brandKey, brandValue }: BrandSeedPayload) => {
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
  test("desktop view stays contained and brand preview can be toggled", async ({ page }) => {
    await seedPreset(
      page,
      {
        crt: 100,
        scanlines: 100,
        noise: 54,
        glow: 82,
        glitch: 40,
        ambient: 64,
      },
      undefined,
    );
    await page.setViewportSize({ width: 1440, height: 2200 });
    await page.goto(BRAND_SYSTEM_URL, { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle(/ManabuPlay Brand System/);
    await expect(page.locator("[data-fx-brand-toggle]")).toBeChecked();
    await expect(page.locator("#fx-preview .fx-stage")).toBeVisible();

    const metrics = await getOverflowMetrics(page);
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
    expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);

    await page.locator("[data-fx-brand-toggle]").uncheck();
    await expect(page.locator("[data-fx-brand-state]")).toHaveText("FX off");
  });

  test("mobile view stays contained", async ({ page }) => {
    await seedPreset(
      page,
      {
        crt: 72,
        scanlines: 64,
        noise: 38,
        glow: 62,
        glitch: 28,
        ambient: 48,
      },
      undefined,
    );
    await page.setViewportSize({ width: 390, height: 1600 });
    await page.goto(BRAND_SYSTEM_URL, { waitUntil: "domcontentloaded" });

    await expect(page.locator(".hero")).toBeVisible();
    await expect(page.locator("#fx-preview .fx-stage")).toBeVisible();

    const metrics = await getOverflowMetrics(page);
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
    expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
  });
});
