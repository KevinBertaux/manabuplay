import { expect, test, type Page } from "@playwright/test";

const FX_LAB_URL = "http://127.0.0.1:4173/docs/fx-lab.html";
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

async function loadFxLab(page: Page) {
  await page.goto(FX_LAB_URL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveTitle(/ManabuPlay FX Lab/);
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

test.describe("fx lab document", () => {
  test("desktop layout stays contained and copy flow responds", async ({ page }, testInfo) => {
    await seedPreset(page, {
      crt: 88,
      scanlines: 42,
      noise: 24,
      glow: 66,
      glitch: 18,
      ambient: 36,
    });
    await page.setViewportSize({ width: 1440, height: 2200 });
    await loadFxLab(page);

    await expectNoHorizontalOverflow(page);
    await expect(page.locator(".fx-stage")).toBeVisible();
    await expect(page.locator("[data-fx-json]")).toContainText('"crt":88');
    await expect(page.locator('[data-fx-enabled="scanlines"]')).toBeChecked();

    await page.locator('input[name="crt"]').fill("100");
    await page.locator('input[name="scanlines"]').fill("0");
    await expect(page.locator('[data-fx-value="scanlines"]')).toHaveText("0");
    const scanlinesLow = Number(
      await page.locator("[data-fx-root]").evaluate((node) =>
        getComputedStyle(node).getPropertyValue("--fx-scanline-opacity").trim(),
      ),
    );
    expect(scanlinesLow).toBeGreaterThan(0);

    await page.locator('input[name="scanlines"]').fill("100");
    const scanlinesFull = Number(
      await page.locator("[data-fx-root]").evaluate((node) =>
        getComputedStyle(node).getPropertyValue("--fx-scanline-opacity").trim(),
      ),
    );
    expect(scanlinesFull).toBeGreaterThan(scanlinesLow);

    await page.locator('input[name="glitch"]').fill("12");
    await expect(page.locator('[data-fx-value="glitch"]')).toHaveText("12");
    await expect(page.locator("[data-fx-json]")).toContainText('"glitch":12');

    await page.locator('[data-fx-enabled="noise"]').uncheck();
    await expect(page.locator('[data-fx-enabled="noise"]')).not.toBeChecked();
    await expect(page.locator("[data-fx-json]")).toContainText('"noise":24');

    await page.locator('[data-fx-edit-toggle="glow"]').click();
    await page.locator('[data-fx-edit="glow"]').fill("84");
    await page.locator('[data-fx-edit="glow"]').press("Enter");
    await expect(page.locator('[data-fx-value="glow"]')).toHaveText("84");

    await page.locator("[data-fx-copy]").click();
    await expect(page.locator("[data-fx-status]")).toContainText(/Preset copied|Preset ready/);
    await expect(page.locator('iframe[data-iso-preview="hero"]')).toBeVisible();
    await expect(page.locator('iframe[data-iso-preview="quiz"]')).toBeVisible();
    await expect(page.locator('iframe[data-iso-preview="hero"]')).toHaveAttribute("src", /4174\/lab\/hero-preview\//);
    await expect(page.locator('iframe[data-iso-preview="quiz"]')).toHaveAttribute("src", /4174\/lab\/quiz-preview\/#quiz/);

    await page.screenshot({
      path: testInfo.outputPath("fx-lab-desktop.png"),
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
    await page.setViewportSize({ width: 390, height: 1800 });
    await loadFxLab(page);

    await expectNoHorizontalOverflow(page);
    await expect(page.locator(".fx-lab-shell")).toBeVisible();

    await page.screenshot({
      path: testInfo.outputPath("fx-lab-mobile.png"),
      fullPage: true,
    });
  });
});
