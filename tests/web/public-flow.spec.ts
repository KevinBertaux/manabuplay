import { expect, test, type Page } from "@playwright/test";
import { ASTRO_HOME_URL, ASTRO_URL, preparePage } from "../helpers/visual";

async function prepareModePage(page: Parameters<typeof preparePage>[0], url: string) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => Boolean(document.querySelector("#startBtn")?.textContent?.trim().length),
    undefined,
    { timeout: 15_000 },
  );
}

async function chooseCurrentCorrectAnswer(page: Page) {
  const correctAnswer = await page.evaluate(() => {
    const typedWindow = window as typeof window & {
      __MANABUPLAY_DATA__?: {
        quizData?: Array<{
          id?: string;
          word: string;
          kana: string;
          romaji?: string | null;
          packId?: string;
          correct?: Record<string, string | undefined>;
        }>;
      };
      __MANABUPLAY_LOCALE__?: string;
    };
    const romaji = document.querySelector("#wordRomaji")?.textContent?.trim();
    const kana = document.querySelector("#wordKana")?.textContent?.trim();
    const word = document.querySelector("#wordDisplay")?.textContent?.trim();
    const locale = document.documentElement.lang || typedWindow.__MANABUPLAY_LOCALE__ || "en";
    const entry = typedWindow.__MANABUPLAY_DATA__?.quizData?.find(
      (candidate) =>
        (candidate.romaji || candidate.kana || candidate.word) === romaji &&
        candidate.kana === kana &&
        candidate.word === word,
    );

    return entry?.correct?.[locale] || entry?.correct?.en || "";
  });

  expect(correctAnswer).not.toBe("");
  const answers = page.locator("#answersGrid .answer-btn");
  const answerCount = await answers.count();
  for (let index = 0; index < answerCount; index += 1) {
    const answer = answers.nth(index);
    const copy = (await answer.locator(".answer-copy").textContent())?.trim();
    if (copy === correctAnswer) {
      await answer.click();
      return;
    }
  }

  throw new Error(`Correct answer "${correctAnswer}" was not rendered as an exact option.`);
}

async function getCurrentQuestionPackId(page: Page) {
  return page.evaluate(() => {
    const typedWindow = window as typeof window & {
      __MANABUPLAY_DATA__?: {
        quizData?: Array<{
          id?: string;
          word: string;
          kana: string;
          romaji?: string | null;
          packId?: string;
        }>;
      };
    };
    const romaji = document.querySelector("#wordRomaji")?.textContent?.trim();
    const kana = document.querySelector("#wordKana")?.textContent?.trim();
    const word = document.querySelector("#wordDisplay")?.textContent?.trim();
    const entry = typedWindow.__MANABUPLAY_DATA__?.quizData?.find(
      (candidate) =>
        (candidate.romaji || candidate.kana || candidate.word) === romaji &&
        candidate.kana === kana &&
        candidate.word === word,
    );

    return entry?.packId || entry?.id?.split(":")[0] || null;
  });
}

async function completeCorrectRun(page: Page) {
  for (let index = 0; index < 10; index += 1) {
    await chooseCurrentCorrectAnswer(page);
    await page.locator("#nextBtn").click();
    if (index < 9) {
      await expect(page.locator("#answersGrid .answer-btn")).toHaveCount(4);
    }
  }
}

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

    await expect(page.locator("#quizArea")).toBeVisible();
    await expect(page.locator("#progressRow")).toBeVisible();
    await expect(page.locator("#answersGrid .answer-btn")).toHaveCount(4);
    await expect(page.locator("#hintBtn")).toBeVisible();
    await expect(page.locator("#hintZone")).toBeVisible();
    await expect(page.locator("#hintText")).toHaveClass(/is-locked/);
    await expect(page.locator("#hintTextSecondary")).toHaveClass(/is-locked/);
    await expect(page.locator("#explanationBox")).toBeHidden();
    await expect(page.locator("#feedback")).toBeHidden();
    await expect(page.locator("#nextBtn")).toHaveClass(/opacity-0/);

    await page.locator("#hintBtn").click();
    await expect(page.locator("#hintText")).toHaveClass(/is-revealed/);
    await expect(page.locator("#hintTextSecondary")).toHaveClass(/is-locked/);
    await expect(page.locator("#explanationBox")).toBeHidden();

    await page.locator("#answersGrid .answer-btn").first().click();
    await expect(page.locator("#feedback")).toBeVisible();
    await expect(page.locator("#explanationBox")).toBeVisible();
    await expect(page.locator("#nextBtn")).not.toHaveClass(/opacity-0/);
    await expect(page.locator("#answersGrid .answer-btn.correct")).toHaveCount(1);
  });

  test("keeps Daily as a one-click run without the Arcade difficulty picker", async ({ page }) => {
    await prepareModePage(page, `${ASTRO_URL}fr/daily/`);

    await expect(page.locator("#quizTitleScreen")).toBeVisible();
    await expect(page.locator("#quizTitleHeadline")).toContainText("Quotidien du");
    await expect(page.locator("#diffGrid")).toBeHidden();
    await expect(page.locator(".diff-card")).toHaveCount(0);
    await page.locator("[data-quiz-action='launchQuiz']").first().click();
    await expect(page.locator("#quizArea")).toBeVisible();
    await expect(page.locator("#quizTitleScreen")).toBeHidden();
    await expect(page.locator("#answersGrid .answer-btn")).toHaveCount(4);
  });

  test("locks the Daily launch once today's run is completed", async ({ page }) => {
    await page.addInitScript(() => {
      const now = new Date();
      const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
        now.getDate(),
      ).padStart(2, "0")}`;
      localStorage.setItem(
        "mp_daily_runs",
        JSON.stringify({
          [dateKey]: {
            dateKey,
            bestScore: 88,
            lastScore: 88,
            attempts: 1,
            correct: 8,
            total: 10,
            bestStreak: 4,
            completedAt: `${dateKey}T08:00:00.000Z`,
            updatedAt: `${dateKey}T08:00:00.000Z`,
            dailyCompletedAt: `${dateKey}T08:00:00.000Z`,
            wordIds: ["quest", "boss"],
          },
        }),
      );
    });
    await prepareModePage(page, `${ASTRO_URL}fr/daily/`);

    await expect(page.locator("#quizTitleHeadline")).toHaveText("Quotidien terminé");
    await expect(page.locator("#quizTitleCopy")).toContainText("Score max : 88 pts");
    await expect(page.locator("#startBtn")).toBeDisabled();
    await expect(page.locator("[data-quiz-action='launchQuiz']").first()).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await page.locator("[data-quiz-action='launchQuiz']").first().click({ force: true });
    await expect(page.locator("#quizArea")).toBeHidden();
  });

  test("shows played archive score and attempts in the monthly calendar", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "mp_daily_runs",
        JSON.stringify({
          "2026-04-16": {
            dateKey: "2026-04-16",
            bestScore: 132,
            lastScore: 118,
            attempts: 2,
            correct: 8,
            total: 10,
            bestStreak: 6,
            completedAt: "2026-04-16T08:00:00.000Z",
            updatedAt: "2026-04-16T09:00:00.000Z",
            dailyCompletedAt: "2026-04-16T08:00:00.000Z",
            wordIds: ["quest", "boss"],
          },
        }),
      );
    });
    await prepareModePage(page, `${ASTRO_URL}fr/archives/?date=2026-04-16`);

    const archiveCell = page.locator(
      "[data-archive-date='2026-04-16'][data-archive-tone='archive']",
    );
    await expect(archiveCell).toHaveClass(/has-record/);
    await expect(archiveCell.locator("[data-archive-status]")).toHaveText("Déjà joué");
    await expect(archiveCell.locator("[data-archive-score]")).toHaveText("132 pts max");
    await expect(archiveCell.locator("[data-archive-attempts]")).toHaveText("2 tentatives");
    await archiveCell.click();
    await expect(page).toHaveURL(/date=2026-04-16/);
  });

  test("stores archive completion and keeps archives replayable", async ({ page }) => {
    await prepareModePage(page, `${ASTRO_URL}fr/archives/?date=2026-04-16`);

    await page.locator("[data-quiz-action='launchQuiz']").first().click();
    await completeCorrectRun(page);

    await expect(page.locator("#resultsArea")).toBeVisible();
    await expect(page.locator("[data-quiz-action='replayDifficulty']")).not.toBeDisabled();
    const records = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("mp_daily_runs") || "{}"),
    );
    expect(records["2026-04-16"]).toMatchObject({
      dateKey: "2026-04-16",
      attempts: 1,
      total: 10,
    });

    await page.locator("[data-quiz-action='replayDifficulty']").click();
    await expect(page.locator("#quizArea")).toBeVisible();
    await expect(page.locator("#answersGrid .answer-btn")).toHaveCount(4);
  });

  test("keeps only one archive month drawer open at a time", async ({ page }) => {
    await prepareModePage(page, `${ASTRO_URL}fr/archives/?date=2026-04-16`);

    await expect(page.locator("[data-archive-month='2026-04']")).toHaveAttribute("open", "");
    await expect(page.locator("[data-archive-month='2026-05']")).not.toHaveAttribute("open", "");

    await page.locator("[data-archive-month='2026-05'] summary").click();

    await expect(page.locator("[data-archive-month='2026-05']")).toHaveAttribute("open", "");
    await expect(page.locator("[data-archive-month='2026-04']")).not.toHaveAttribute("open", "");
  });

  test("keeps Arcade as the only mode with explicit difficulty selection", async ({ page }) => {
    await prepareModePage(page, `${ASTRO_URL}fr/arcade/`);

    await expect(page.locator("#diffGrid")).toBeVisible();
    await expect(page.locator(".diff-card")).toHaveCount(4);
    await page.locator(".diff-card").first().click();
    await page.locator("#startBtn").click();
    await expect(page.locator("#quizArea")).toBeVisible();
  });

  test("keeps Arcade browser sessions inside one random pack", async ({ page }) => {
    await prepareModePage(page, `${ASTRO_URL}fr/arcade/`);

    await page.locator("#diffGrid .diff-card").nth(1).click();
    await page.locator("#startBtn").click();
    const selectedPackId = await getCurrentQuestionPackId(page);

    expect(selectedPackId).not.toBeNull();
    await completeCorrectRun(page);

    const sessions = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("mp_practice_sessions") || "[]"),
    );
    expect(sessions[0]).toMatchObject({ diffId: "normal", packId: selectedPackId });
    expect(
      sessions[0].wordIds.every((wordId: string) => wordId.startsWith(`${selectedPackId}:`)),
    ).toBe(true);
  });

  test("scores hints as reduced base points before the final combo multiplier", async ({
    page,
  }) => {
    await prepareModePage(page, `${ASTRO_URL}fr/daily/`);

    await page.locator("[data-quiz-action='launchQuiz']").first().click();
    await page.locator("#hintBtn").click();
    await chooseCurrentCorrectAnswer(page);
    await expect(page.locator("#scoreDisplay")).toHaveText("8");

    await page.locator("#nextBtn").click();
    await page.locator("#hintBtn").click();
    await page.locator("#hintBtn").click();
    await chooseCurrentCorrectAnswer(page);
    await expect(page.locator("#scoreDisplay")).toHaveText("13");
  });

  test("scores a perfect no-hint run at 200 after the combo multiplier", async ({ page }) => {
    await prepareModePage(page, `${ASTRO_URL}fr/daily/`);

    await page.locator("[data-quiz-action='launchQuiz']").first().click();
    const selectedPackId = await getCurrentQuestionPackId(page);

    expect(selectedPackId).not.toBeNull();
    await completeCorrectRun(page);

    await expect(page.locator("#resultsArea")).toBeVisible();
    await expect(page.locator("#finalBaseScore")).toHaveText("100 pts");
    await expect(page.locator("#finalComboMultiplier")).toHaveText("x2.0");
    await expect(page.locator("#finalScore")).toHaveText("200 pts", { timeout: 12_000 });
    await expect(page.locator("#finalPercent")).toHaveText("100%");
    await expect(page.locator("[data-quiz-action='replayDifficulty']")).toBeDisabled();
    const records = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("mp_daily_runs") || "{}"),
    );
    const dailyRecord = Object.values(records)[0] as { wordIds?: string[] } | undefined;
    expect(dailyRecord?.wordIds?.length).toBe(10);
    expect(dailyRecord?.wordIds?.every((wordId) => wordId.startsWith(`${selectedPackId}:`))).toBe(
      true,
    );

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      () => Boolean(document.querySelector("#startBtn")?.textContent?.trim().length),
      undefined,
      { timeout: 15_000 },
    );
    await expect(page.locator("#quizTitleHeadline")).toHaveText("Quotidien terminé");
    await expect(page.locator("#startBtn")).toBeDisabled();
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
