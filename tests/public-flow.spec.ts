import { expect, test } from "@playwright/test";
import { ASTRO_URL, preparePage } from "./helpers/visual";

test.describe("public flow", () => {
  test("switches language and keeps the hero CTA prominent", async ({ page }) => {
    await preparePage(page, ASTRO_URL);

    await expect(page.locator("[data-i18n='hero_cta']")).toHaveText("Start the quiz");
    await page.locator("#btnFR").click();
    await expect(page.locator("#htmlRoot")).toHaveAttribute("lang", "fr");
    await expect(page.locator("[data-i18n='hero_cta']")).toHaveText("Lancer le quiz");
    await expect(page.locator("[data-i18n='hero_tagline']")).toContainText("Apprends du vocabulaire japonais");
  });

  test("starts a quiz session and reveals answer feedback", async ({ page }) => {
    await preparePage(page, ASTRO_URL);

    await page.locator("[data-i18n='hero_cta']").click();
    await expect(page).toHaveURL(/#quiz/);

    const diffCard = page.locator(".diff-card").first();
    await diffCard.click();
    await page.locator("#startBtn").click();

    await expect(page.locator("#quizArea")).toBeVisible();
    await expect(page.locator("#progressRow")).toBeVisible();
    await expect(page.locator("#answersGrid .answer-btn")).toHaveCount(4);

    await page.locator("#hintBtn").click();
    await expect(page.locator("#hintText")).toBeVisible();

    await page.locator("#answersGrid .answer-btn").first().click();
    await expect(page.locator("#feedback")).toBeVisible();
    await expect(page.locator("#nextBtn")).not.toHaveClass(/opacity-0/);
    await expect(page.locator("#answersGrid .answer-btn.correct")).toHaveCount(1);
  });

  test("shows the waitlist success state from prior local submission", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("mp_email_submitted", JSON.stringify(true));
    });
    await preparePage(page, ASTRO_URL);

    await expect(page.locator("form[name='manabuplay-waitlist']")).toBeHidden();
    await expect(page.locator("#emailSuccess")).toBeVisible();
  });
});
