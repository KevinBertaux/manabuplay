import { expect, test, type Page } from "@playwright/test";
import { ASTRO_URL } from "../helpers/visual";

const LOCALES = [
  {
    locale: "en",
    tagline: "Turn familiar Japanese words into vocabulary",
    daily: "Daily",
    arcade: "Arcade",
  },
  {
    locale: "fr",
    tagline: "Transforme les mots japonais que tu repères déjà",
    daily: "Quotidien",
    arcade: "Arcade",
  },
] as const;

async function prepareQuizPage(page: Page, url: string) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => Boolean(document.querySelector("#startBtn")?.textContent?.trim().length),
    undefined,
    { timeout: 15_000 },
  );
}

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

  for (const { locale, tagline, daily, arcade } of LOCALES) {
    test(`renders localized home for ${locale}`, async ({ page }) => {
      await page.goto(`${ASTRO_URL}${locale}/`, { waitUntil: "domcontentloaded" });

      await expect(page.locator("#htmlRoot")).toHaveAttribute("lang", locale);
      await expect(page.locator("h1")).toContainText(tagline);
      const productNav = page.getByLabel("Product navigation");
      await expect(productNav.locator("[data-public-route='daily']")).toContainText(daily);
      await expect(productNav.locator("[data-public-route='arcade']")).toContainText(arcade);
      await expect(productNav.locator("[data-public-route='daily']")).toHaveAttribute(
        "href",
        `/${locale}/daily/`,
      );
      await expect(productNav.locator("[data-public-route='arcade']")).toHaveAttribute(
        "href",
        `/${locale}/arcade/`,
      );
      await expect(productNav.locator("[data-public-route='archives']")).toHaveAttribute(
        "href",
        `/${locale}/archives/`,
      );
      await expect(page.locator(".public-site-footer")).toContainText(
        locale === "fr" ? "Site réalisé par Kxis" : "Built by Kxis",
      );
    });
  }

  test("renders localized legal pages and footer links", async ({ page }) => {
    await page.goto(`${ASTRO_URL}fr/legal/`, { waitUntil: "domcontentloaded" });

    await expect(page.locator("#htmlRoot")).toHaveAttribute("lang", "fr");
    await expect(page.locator("h1")).toContainText("Mentions légales");
    await expect(page.locator("body")).toContainText("938 401 767");
    await expect(page.locator("body")).toContainText("Senpai Surprise");
    await expect(page.locator("body")).toContainText("Microsoft Clarity");
    await expect(page.locator(".public-site-footer a[href='/fr/privacy/']")).toContainText(
      "Confidentialité",
    );

    await page.goto(`${ASTRO_URL}en/privacy/`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toContainText("Privacy Policy");
    await expect(page.locator("body")).toContainText("Netlify Forms");
    await expect(page.locator("body")).toContainText("Microsoft Clarity");
    await expect(page.locator(".public-site-footer a[href='/en/legal/']")).toContainText(
      "Legal notice",
    );
  });

  test("requires explicit email consent on the home waitlist form", async ({ page }) => {
    await page.goto(`${ASTRO_URL}en/`, { waitUntil: "domcontentloaded" });
    await page.locator("#emailInput").fill("player@example.com");
    await page.locator('form[name="manabuplay-waitlist"] button[type="submit"]').click();
    await expect(page.locator("#emailConsent")).toBeFocused();
    await expect(page.locator("#emailWaitlistHint")).toBeVisible();
    await expect(page.locator("#emailConsent")).toHaveAttribute("aria-invalid", "true");
    await page.locator("#emailConsent").check();
    await page.locator('form[name="manabuplay-waitlist"] button[type="submit"]').click();
    await expect(page.locator("#emailSuccess")).toBeVisible();
  });

  test("hides the locale switch on mobile viewports", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${ASTRO_URL}fr/`, { waitUntil: "domcontentloaded" });

    await expect(page.locator(".public-locale-switch")).toBeHidden();
  });

  test("opens the mobile mode burger menu", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${ASTRO_URL}fr/arcade/`, { waitUntil: "domcontentloaded" });

    await expect(page.locator(".public-mode-nav-desktop")).toBeHidden();
    await expect(page.locator("#public-mode-menu-trigger")).toBeVisible();
    await expect(page.locator("#public-mode-menu-trigger")).toHaveAttribute("aria-label", "Menu");
    await expect(page.locator("#public-mode-menu-panel")).toBeHidden();

    await page.locator("#public-mode-menu-trigger").click();
    await expect(page.locator("#public-mode-menu-panel")).toBeVisible();
    await expect(page.locator("#public-mode-menu-panel [data-public-route='daily']")).toHaveAttribute(
      "href",
      "/fr/daily/",
    );
    await expect(page.locator("#public-mode-menu-panel [data-public-route='archives']")).toContainText(
      "Archives",
    );
  });

  test("preserves the current product mode when switching locale", async ({ page }) => {
    await page.goto(`${ASTRO_URL}fr/arcade/`, { waitUntil: "domcontentloaded" });

    await expect(page.locator("#htmlRoot")).toHaveAttribute("lang", "fr");
    await expect(page.locator("h1")).toHaveText("Mode Arcade");
    await expect(page.getByRole("link", { name: "Accueil" })).toHaveAttribute("href", "/fr/");
    await expect(page.locator(".public-locale-switch a", { hasText: "EN" })).toHaveAttribute(
      "href",
      "/en/arcade/",
    );
    await expect(page.locator(".public-locale-switch a", { hasText: "ES" })).toHaveCount(0);
  });

  test("renders the real localized daily quiz", async ({ page }) => {
    await prepareQuizPage(page, `${ASTRO_URL}fr/daily/`);

    await expect(page.locator("#htmlRoot")).toHaveAttribute("lang", "fr");
    await expect(page.locator("h1")).toHaveText("Quiz japonais du jour");
    await expect(page.getByRole("link", { name: "Accueil" })).toHaveAttribute("href", "/fr/");
    await expect(page.locator("#quizTitleScreen")).toBeVisible();
    await expect(page.locator("#quizTitleHeadline")).toContainText("Quotidien du");
    await expect(page.locator("#diffGrid")).toBeHidden();
    await expect(page.locator(".diff-card")).toHaveCount(0);

    await page.locator("[data-quiz-action='launchQuiz']").first().click();

    await expect(page.locator("#quizArea")).toBeVisible();
    await expect(page.locator("#quizTitleScreen")).toBeHidden();
    await expect(page.locator("#progressText")).toHaveText("0/10");
    await expect(page.locator("#answersGrid .answer-btn")).toHaveCount(4);
  });

  test("renders the real localized arcade quiz", async ({ page }) => {
    await prepareQuizPage(page, `${ASTRO_URL}fr/arcade/`);

    await expect(page.locator("#htmlRoot")).toHaveAttribute("lang", "fr");
    await expect(page.locator("h1")).toHaveText("Mode Arcade");
    await expect(page.getByRole("link", { name: "Accueil" })).toHaveAttribute("href", "/fr/");
    await expect(page.locator("#diffGrid .diff-card")).toHaveCount(4);
    await expect(page.locator("#diffGrid .diff-card").nth(1)).toContainText("STANDARD");

    await page.locator("#diffGrid .diff-card").first().click();
    await page.locator("#startBtn").click();

    await expect(page.locator("#quizArea")).toBeVisible();
    await expect(page.locator("#progressText")).toHaveText("0/10");
    await expect(page.locator("#answersGrid .answer-btn")).toHaveCount(4);
    await page.locator("#hintBtn").click();
    await expect(page.locator("#hintText")).toHaveClass(/is-revealed/);
    await expect(page.locator("#hintTextSecondary")).toHaveClass(/is-locked/);
    await expect(page.locator("#hintContent")).toBeVisible();
    await page.locator("#hintBtn").click();
    await expect(page.locator("#hintTextSecondary")).toHaveClass(/is-revealed/);
    await page.locator("#answersGrid .answer-btn").first().click();
    await expect(page.locator("#explanationBox")).toBeVisible();
  });

  test("renders archives by date and plays the selected archive", async ({ page }) => {
    await prepareQuizPage(page, `${ASTRO_URL}fr/archives/?date=2026-04-16`);

    await expect(page.locator("#htmlRoot")).toHaveAttribute("lang", "fr");
    await expect(page.locator("h1")).toHaveText("Archives");
    await expect(page.getByRole("link", { name: "Accueil" })).toHaveAttribute("href", "/fr/");
    await expect(
      page.locator("[data-archive-date='2026-04-16'][data-archive-tone='archive']"),
    ).toHaveClass(/is-active/);
    await expect(page.locator("#archiveSelectedLabel")).toContainText("16 avril 2026");
    await expect(page.locator("[data-archive-month='2026-04']")).toHaveAttribute("open", "");
    await expect(
      page.locator("[data-archive-month='2026-04'] .archive-calendar-weekdays"),
    ).toBeVisible();
    await expect(page.locator("#quizTitleScreen")).toBeVisible();
    await expect(page.locator("#quizTitleHeadline")).toContainText("16 avril 2026");
    await expect(page.locator("#diffGrid")).toBeHidden();
    await expect(page.locator(".diff-card")).toHaveCount(0);

    await page.locator("[data-quiz-action='launchQuiz']").first().click();

    await expect(page.locator("#quizArea")).toBeVisible();
    await expect(page.locator("#quizTitleScreen")).toBeHidden();
    await expect(page.locator("#progressText")).toHaveText("0/10");
    await expect(page.locator("#answersGrid .answer-btn")).toHaveCount(4);
  });
});
