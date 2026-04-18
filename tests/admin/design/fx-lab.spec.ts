import { expect, test, type Page } from "@playwright/test";
import { ADMIN_URL } from "../helpers/admin";

const FX_LAB_URL = `${ADMIN_URL}design/fx/`;
const STORAGE_KEY = "manabuplay_fx_preset_v1";

type FxPresetValues = {
  crt: number;
  scanlines: number;
  noise: number;
  glow: number;
  glitch: number;
  ambient: number;
};

type FxPresetEnabled = Partial<Record<keyof FxPresetValues, boolean>>;

type FxSeedPayload = {
  key: string;
  value: string;
};

async function seedPreset(page: Page, values: FxPresetValues, enabled?: FxPresetEnabled) {
  await page.addInitScript(
    ({ key, value }: FxSeedPayload) => window.localStorage.setItem(key, value),
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

test.describe("fx lab document", () => {
  test("desktop view stays contained and the preview reacts", async ({ page }) => {
    await seedPreset(
      page,
      {
        crt: 88,
        scanlines: 42,
        noise: 24,
        glow: 66,
        glitch: 18,
        ambient: 36,
      },
      undefined,
    );
    await page.setViewportSize({ width: 1440, height: 2200 });
    await page.goto(FX_LAB_URL, { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle(/ManabuPlay FX Lab/);
    await expect(page.locator(".fx-stage")).toBeVisible();
    await expect(page.locator("[data-fx-json]")).toContainText('"crt":88');

    const metrics = await getOverflowMetrics(page);
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
    expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);

    await page.locator('input[name="crt"]').fill("100");
    await page.locator("[data-fx-copy]").click();
    await expect(page.locator("[data-fx-status]")).toContainText(/Preset copied|Preset ready/);
    await expect(page.locator('iframe[data-iso-preview="hero"]')).toBeVisible();
    await expect(page.locator('iframe[data-iso-preview="quiz"]')).toBeVisible();
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
    await page.setViewportSize({ width: 390, height: 1800 });
    await page.goto(FX_LAB_URL, { waitUntil: "domcontentloaded" });

    await expect(page.locator(".fx-lab-shell")).toBeVisible();

    const metrics = await getOverflowMetrics(page);
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
    expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
  });
});
