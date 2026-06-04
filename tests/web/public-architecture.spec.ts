import { expect, test, type Page } from "@playwright/test";
import { ASTRO_URL } from "../helpers/visual";
import {
  DESKTOP_VIEWPORT,
  MOBILE_VIEWPORT,
  VIEWPORT_BELOW_MD,
  VIEWPORT_MD,
  desktopModeNav,
  localeSwitch,
  mobileModeMenuPanel,
  mobileModeMenuTrigger,
} from "../helpers/public-shell";

const LOCALES = [
  {
    locale: "en",
    tagline: "Turn familiar Japanese words into vocabulary",
    daily: "Daily",
    arcade: "Arcade",
    archives: "Archives",
    footerTagline: "Daily vocabulary quizzes — gaming & pop culture",
  },
  {
    locale: "fr",
    tagline: "Transforme les mots japonais que tu repères déjà",
    daily: "Quotidien",
    arcade: "Arcade",
    archives: "Archives",
    footerTagline: "Quiz quotidiens de vocabulaire — gaming & pop culture",
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

  for (const { locale, tagline, daily, arcade, archives, footerTagline } of LOCALES) {
    test(`renders localized home for ${locale}`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await page.goto(`${ASTRO_URL}${locale}/`, { waitUntil: "domcontentloaded" });

      await expect(page.locator("#htmlRoot")).toHaveAttribute("lang", locale);
      await expect(page.locator("h1")).toContainText(tagline);

      const segmentedNav = desktopModeNav(page);
      await expect(segmentedNav).toBeVisible();
      await expect(segmentedNav.locator("[data-public-route='daily']")).toContainText(daily);
      await expect(segmentedNav.locator("[data-public-route='arcade']")).toContainText(arcade);
      await expect(segmentedNav.locator("[data-public-route='archives']")).toContainText(archives);
      await expect(segmentedNav.locator("[data-public-route='daily']")).toHaveAttribute(
        "href",
        `/${locale}/daily/`,
      );
      await expect(segmentedNav.locator("[data-public-route='arcade']")).toHaveAttribute(
        "href",
        `/${locale}/arcade/`,
      );
      await expect(segmentedNav.locator("[data-public-route='archives']")).toHaveAttribute(
        "href",
        `/${locale}/archives/`,
      );

      await expect(page.locator(".public-site-footer")).toContainText(
        locale === "fr" ? "Site réalisé par Kxis" : "Built by Kxis",
      );
      await expect(page.locator(".public-site-footer-zone--tagline")).toContainText(footerTagline);
    });
  }

  test("renders segmented desktop nav as a single control group", async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto(`${ASTRO_URL}fr/`, { waitUntil: "domcontentloaded" });

    const segmentedNav = desktopModeNav(page);
    await expect(segmentedNav).toHaveClass(/public-mode-nav-segmented/);
    await expect(segmentedNav.locator(".public-mode-seg")).toHaveCount(3);
    await expect(segmentedNav.locator(".public-mode-seg--first")).toHaveCount(1);
    await expect(segmentedNav.locator(".public-mode-seg--last")).toHaveCount(1);
    await expect(mobileModeMenuTrigger(page)).toBeHidden();
    await expect(localeSwitch(page)).toBeVisible();
  });

  test("hides locale switch and desktop nav below md", async ({ page }) => {
    await page.setViewportSize(VIEWPORT_BELOW_MD);
    await page.goto(`${ASTRO_URL}fr/`, { waitUntil: "domcontentloaded" });

    await expect(localeSwitch(page)).toBeHidden();
    await expect(desktopModeNav(page)).toBeHidden();
    await expect(mobileModeMenuTrigger(page)).toBeVisible();
  });

  test("shows locale switch and desktop nav from md", async ({ page }) => {
    await page.setViewportSize(VIEWPORT_MD);
    await page.goto(`${ASTRO_URL}fr/`, { waitUntil: "domcontentloaded" });

    await expect(localeSwitch(page)).toBeVisible();
    await expect(desktopModeNav(page)).toBeVisible();
    await expect(mobileModeMenuTrigger(page)).toBeHidden();
  });

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
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto(`${ASTRO_URL}fr/`, { waitUntil: "domcontentloaded" });

    await expect(localeSwitch(page)).toBeHidden();
  });

  test("opens the mobile mode burger menu", async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto(`${ASTRO_URL}fr/arcade/`, { waitUntil: "domcontentloaded" });

    await expect(desktopModeNav(page)).toBeHidden();
    await expect(mobileModeMenuTrigger(page)).toBeVisible();
    await expect(mobileModeMenuTrigger(page)).toHaveAttribute("aria-label", "Menu");
    await expect(mobileModeMenuPanel(page)).toBeHidden();

    await mobileModeMenuTrigger(page).click();
    await expect(mobileModeMenuPanel(page)).toBeVisible();
    await expect(mobileModeMenuPanel(page).locator("[data-public-route='daily']")).toHaveAttribute(
      "href",
      "/fr/daily/",
    );
    await expect(mobileModeMenuPanel(page).locator("[data-public-route='archives']")).toContainText(
      "Archives",
    );
  });

  test("preserves the current product mode when switching locale", async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto(`${ASTRO_URL}fr/arcade/`, { waitUntil: "domcontentloaded" });

    await expect(page.locator("#htmlRoot")).toHaveAttribute("lang", "fr");
    await expect(
      desktopModeNav(page).locator("a[data-public-route='arcade'][aria-current='page']"),
    ).toBeVisible();
    await expect(localeSwitch(page).locator("a", { hasText: "EN" })).toHaveAttribute(
      "href",
      "/en/arcade/",
    );
    await expect(localeSwitch(page).locator("a", { hasText: "ES" })).toHaveCount(0);
  });

  test("renders the real localized daily quiz", async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await prepareQuizPage(page, `${ASTRO_URL}fr/daily/`);

    await expect(page.locator("#htmlRoot")).toHaveAttribute("lang", "fr");
    await expect(
      desktopModeNav(page).locator("a[data-public-route='daily'][aria-current='page']"),
    ).toBeVisible();
    await expect(page.locator("#quizTitleScreen")).toBeVisible();
    await expect(page.locator("#quizTitleHeadline")).toContainText("Quotidien ·");
    await expect(page.locator("#diffGrid")).toBeHidden();
    await expect(page.locator(".diff-card")).toHaveCount(0);

    await page.locator("[data-quiz-action='launchQuiz']").first().click();

    await expect(page.locator("#quizArea")).toBeVisible();
    await expect(page.locator("#quizTitleScreen")).toBeHidden();
    await expect(page.locator("#progressText")).toHaveText("0/10");
    await expect(page.locator("#answersGrid .answer-btn")).toHaveCount(4);
  });

  test("renders the real localized arcade quiz", async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await prepareQuizPage(page, `${ASTRO_URL}fr/arcade/`);

    await expect(page.locator("#htmlRoot")).toHaveAttribute("lang", "fr");
    await expect(
      desktopModeNav(page).locator("a[data-public-route='arcade'][aria-current='page']"),
    ).toBeVisible();
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

  test("marks today on the archive calendar with a Daily link", async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await prepareQuizPage(page, `${ASTRO_URL}fr/archives/`);

    const todayCell = page.locator("[data-archive-tone='today']");
    await expect(todayCell).toBeVisible();
    await expect(todayCell).toContainText("Aujourd'hui");
    await expect(todayCell).toContainText("Quiz du jour");
    await expect(todayCell.locator(".archive-calendar-daily-link")).toHaveAttribute(
      "href",
      /\/fr\/daily\/?$/,
    );
    await expect(todayCell.locator(".archive-calendar-daily-link")).toHaveText("Quotidien");
    await expect(todayCell.locator(".archive-calendar-daily-link")).toBeVisible();
  });

  test("renders archives by date and plays the selected archive", async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await prepareQuizPage(page, `${ASTRO_URL}fr/archives/?date=2026-04-16`);

    await expect(page.locator("#htmlRoot")).toHaveAttribute("lang", "fr");
    await expect(
      desktopModeNav(page).locator("a[data-public-route='archives'][aria-current='page']"),
    ).toBeVisible();
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
