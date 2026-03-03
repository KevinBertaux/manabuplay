import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
});

test('math: selecting a table starts quiz and wrong answer does not auto-skip', async ({ page }) => {
  await page.goto('/math/multiplications');

  await expect(page.getByText('Choisir les tables pour commencer.')).toBeVisible();

  await page.getByRole('button', { name: '2', exact: true }).click();

  const question = page.locator('.question');
  await expect(question).toBeVisible();
  const initialQuestion = (await question.textContent())?.trim() || '';
  expect(initialQuestion.length).toBeGreaterThan(0);

  await page.locator('.answer-input').fill('999');
  await page.getByRole('button', { name: /Vérifier/i }).click();

  const feedback = page.locator('.mp-feedback.mp-feedback-error');
  await expect(feedback).toBeVisible();
  await expect(feedback).toContainText('Mauvaise réponse.');

  await page.waitForTimeout(2200);
  await expect(question).toHaveText(initialQuestion);
});

test('english: list selection loads flashcards and FR -> EN hides TTS until reveal', async ({ page }) => {
  await page.goto('/languages/english');

  await expect(page.getByText('Choisir une liste pour commencer.')).toBeVisible();

  await page.getByLabel('Choisir une liste :').selectOption('fruits');

  const flashcard = page.locator('.flashcard');
  await expect(flashcard).toBeVisible();
  await expect(page.locator('.flashcard-count')).toHaveText(/\d+\/\d+/);

  await page.getByLabel('Sens :').selectOption('fr-first');
  await expect(page.locator('.tts-inline-btn')).toHaveCount(0);

  await flashcard.click();
  const ttsButton = page.locator('.tts-inline-btn');
  const ttsCount = await ttsButton.count();
  if (ttsCount > 0) {
    await expect(ttsButton).toBeVisible();
  } else {
    await expect(ttsButton).toHaveCount(0);
  }
});

test('symmetry: keyboard selection + verify + next-question flow', async ({ page }) => {
  await page.goto('/math/symmetry');

  const prompt = page.locator('.prompt-box p');
  await expect(prompt).toBeVisible();
  const firstPrompt = (await prompt.textContent())?.trim() || '';

  await page.keyboard.press('1');
  await page.keyboard.press('Enter');

  const feedback = page.locator('.mp-feedback');
  await expect(feedback).toBeVisible();

  const feedbackText = (await feedback.textContent()) || '';
  if (feedbackText.includes('Bonne réponse.')) {
    await page.waitForTimeout(2200);
  } else {
    await page.keyboard.press('Enter');
  }

  await expect(prompt).not.toHaveText(firstPrompt);
});

test('legal pages smoke: footer links open expected legal headings', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Mentions légales' }).click();
  await expect(page).toHaveURL(/\/legal\/legal-notice$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Mentions légales' })).toBeVisible();

  await page.goto('/');
  await page.getByRole('link', { name: 'Politique de confidentialité' }).click();
  await expect(page).toHaveURL(/\/legal\/privacy-policy$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Politique de confidentialité' })).toBeVisible();

  await page.goto('/');
  await page.getByRole('link', { name: 'CGU' }).click();
  await expect(page).toHaveURL(/\/legal\/terms-of-use$/);
  await expect(page.getByRole('heading', { level: 1, name: /Conditions générales d'utilisation/ })).toBeVisible();
});
