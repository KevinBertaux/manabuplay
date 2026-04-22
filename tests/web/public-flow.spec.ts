import { expect, test } from "@playwright/test";
import { ASTRO_HOME_URL, preparePage } from "../helpers/visual";

test.describe("public flow", () => {
  test("switches language and keeps the hero CTA prominent", async ({ page }) => {
    await preparePage(page, ASTRO_HOME_URL);

    await expect(page.locator("[data-i18n='hero_cta']")).toHaveText("Start the quiz");
    await page.locator("#btnFR").click();
    await expect(page.locator("#htmlRoot")).toHaveAttribute("lang", "fr");
    await expect(page.locator("[data-i18n='hero_cta']")).toHaveText("Lancer le quiz");
    await expect(page.locator("[data-i18n='hero_tagline']")).toContainText(
      "Apprends du vocabulaire japonais",
    );
    await expect(page.locator("#btnES")).toHaveCount(0);
  });

  test("starts a quiz session and reveals answer feedback", async ({ page }) => {
    await preparePage(page, ASTRO_HOME_URL);

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

  test("keeps the waitlist form usable on shared devices", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("mp_email_submitted", JSON.stringify(true));
    });
    await preparePage(page, ASTRO_HOME_URL);

    await expect(page.locator("form[name='manabuplay-waitlist']")).toBeVisible();
    await expect(page.locator("#emailSuccess")).toBeHidden();
  });

  test("stores local waitlist submissions and accepts plus addressing", async ({ page }) => {
    await preparePage(page, ASTRO_HOME_URL);

    await page.locator("#emailInput").fill("machin.truc+site@mail.tld");
    await page.locator("form[name='manabuplay-waitlist'] button[type='submit']").click();

    await expect(page.locator("form[name='manabuplay-waitlist']")).toBeVisible();
    await expect(page.locator("#emailSuccess")).toBeVisible();
    await expect(page.locator("#emailInput")).toHaveValue("");

    const submissions = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("mp_waitlist_submissions") || "[]"),
    );
    expect(submissions).toHaveLength(1);
    expect(submissions[0]).toMatchObject({
      email: "machin.truc+site@mail.tld",
      source: "localStorage",
      formName: "manabuplay-waitlist",
    });
  });

  test("rejects URL-like invalid waitlist emails", async ({ page }) => {
    await preparePage(page, ASTRO_HOME_URL);

    await page.locator("#emailInput").fill("https//espaceclient.linxea.com/epargne@o.o");
    await page.locator("form[name='manabuplay-waitlist'] button[type='submit']").click();

    await expect(page.locator("#emailInput")).toHaveJSProperty(
      "validationMessage",
      "Enter a valid email address.",
    );
    await expect(page.locator("#emailSuccess")).toBeHidden();
    const submissions = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("mp_waitlist_submissions") || "[]"),
    );
    expect(submissions).toHaveLength(0);
  });

  test("shows repeatable feedback for two waitlist submissions in a row", async ({ page }) => {
    await preparePage(page, ASTRO_HOME_URL);
    const input = page.locator("#emailInput");
    const submit = page.locator("form[name='manabuplay-waitlist'] button[type='submit']");
    const success = page.locator("#emailSuccess");

    await input.fill("first+site@mail.tld");
    await submit.click();
    await expect(success).toBeVisible();
    await expect(success).toContainText("Thanks, you're on the list.");
    await expect(submit).toHaveText("Saved");
    await expect(input).toHaveValue("");

    await input.fill("second+site@mail.tld");
    await submit.click();
    await expect(success).toHaveClass(/waitlist-success-pop/);
    await expect(submit).toHaveText("Saved");

    const submissions = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("mp_waitlist_submissions") || "[]"),
    );
    expect(submissions.map((entry: { email: string }) => entry.email)).toEqual([
      "second+site@mail.tld",
      "first+site@mail.tld",
    ]);

    await expect(success).toBeHidden({ timeout: 6000 });
  });
});
