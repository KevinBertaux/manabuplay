import { expect, test } from "@playwright/test";
import { ASTRO_URL } from "./helpers/visual";

const LOCALES = [
  { locale: "en", tagline: "Learn Japanese vocabulary", daily: "Daily" },
  { locale: "fr", tagline: "Apprends du vocabulaire japonais", daily: "Quotidien" },
] as const;

test.describe("public localized architecture", () => {
  test("redirects root to a supported browser locale or english fallback", async ({ browser }) => {
    const frenchContext = await browser.newContext({ locale: "fr-FR" });
    const frenchPage = await frenchContext.newPage();
    await frenchPage.goto(ASTRO_URL, { waitUntil: "domcontentloaded" });
    await expect(frenchPage).toHaveURL(/\/fr\/$/);
    await frenchContext.close();

    const fallbackContext = await browser.newContext({ locale: "de-DE" });
    const fallbackPage = await fallbackContext.newPage();
    await fallbackPage.goto(ASTRO_URL, { waitUntil: "domcontentloaded" });
    await expect(fallbackPage).toHaveURL(/\/en\/$/);
    await fallbackContext.close();
  });

  for (const { locale, tagline, daily } of LOCALES) {
    test(`renders localized home for ${locale}`, async ({ page }) => {
      await page.goto(`${ASTRO_URL}${locale}/`, { waitUntil: "domcontentloaded" });

      await expect(page.locator("#htmlRoot")).toHaveAttribute("lang", locale);
      await expect(page.locator("h1")).toContainText(tagline);
      await expect(page.locator("[data-public-route='daily']")).toContainText(daily);
      await expect(page.locator("[data-public-route='daily']")).toHaveAttribute("href", `/${locale}/daily/`);
      await expect(page.locator("[data-public-route='practice']")).toHaveAttribute("href", `/${locale}/practice/`);
      await expect(page.locator("[data-public-route='archives']")).toHaveAttribute("href", `/${locale}/archives/`);
    });
  }

  test("preserves the current product mode when switching locale", async ({ page }) => {
    await page.goto(`${ASTRO_URL}fr/practice/`, { waitUntil: "domcontentloaded" });

    await expect(page.locator("#htmlRoot")).toHaveAttribute("lang", "fr");
    await expect(page.locator("h1")).toHaveText("Mode Libre");
    await expect(page.locator(".public-locale-switch a", { hasText: "EN" })).toHaveAttribute("href", "/en/practice/");
    await expect(page.locator(".public-locale-switch a", { hasText: "ES" })).toHaveCount(0);
  });

  test("renders the real localized daily quiz", async ({ page }) => {
    await page.goto(`${ASTRO_URL}fr/daily/`, { waitUntil: "domcontentloaded" });

    await expect(page.locator("#htmlRoot")).toHaveAttribute("lang", "fr");
    await expect(page.locator("h1")).toHaveText("Quiz quotidien");
    await expect(page.locator("#diffGrid .diff-card")).toHaveCount(1);
    await expect(page.locator("#diffGrid .diff-card")).toContainText("QUOTIDIEN");

    await page.locator("#diffGrid .diff-card").click();
    await page.locator("#startBtn").click();

    await expect(page.locator("#quizArea")).toBeVisible();
    await expect(page.locator("#progressText")).toHaveText("0/10");
    await expect(page.locator("#answersGrid .answer-btn")).toHaveCount(4);
  });

  test("renders the real localized practice quiz", async ({ page }) => {
    await page.goto(`${ASTRO_URL}fr/practice/`, { waitUntil: "domcontentloaded" });

    await expect(page.locator("#htmlRoot")).toHaveAttribute("lang", "fr");
    await expect(page.locator("h1")).toHaveText("Mode Libre");
    await expect(page.locator("#diffGrid .diff-card")).toHaveCount(4);
    await expect(page.locator("#diffGrid .diff-card").nth(1)).toContainText("STANDARD");

    await page.locator("#diffGrid .diff-card").first().click();
    await page.locator("#startBtn").click();

    await expect(page.locator("#quizArea")).toBeVisible();
    await expect(page.locator("#progressText")).toHaveText("0/10");
    await expect(page.locator("#answersGrid .answer-btn")).toHaveCount(4);
  });

  test("renders archives by date and plays the selected archive", async ({ page }) => {
    await page.goto(`${ASTRO_URL}fr/archives/?date=2026-04-16`, { waitUntil: "domcontentloaded" });

    await expect(page.locator("#htmlRoot")).toHaveAttribute("lang", "fr");
    await expect(page.locator("h1")).toHaveText("Archives");
    await expect(page.locator("[data-archive-date='2026-04-16']")).toHaveClass(/is-active/);
    await expect(page.locator("#archiveSelectedLabel")).toContainText("16 avril 2026");
    await expect(page.locator("#diffGrid .diff-card")).toHaveCount(1);

    await page.locator("#diffGrid .diff-card").click();
    await page.locator("#startBtn").click();

    await expect(page.locator("#quizArea")).toBeVisible();
    await expect(page.locator("#progressText")).toHaveText("0/10");
    await expect(page.locator("#answersGrid .answer-btn")).toHaveCount(4);
  });
});
