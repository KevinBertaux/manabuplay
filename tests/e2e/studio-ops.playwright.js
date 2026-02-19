import { expect, test } from '@playwright/test';

const ADMIN_LOGIN = ['e2e', 'admin'].join('-');
const ADMIN_KEY = ['E2E', 'Admin', '123!'].join('_');
const SESSION_KEY = 'manabuplay_admin_session_v1';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
});

test('full browser flow: /-/studio-ops to panel, then redirect after session expiration', async ({ page }) => {
  await page.goto('/-/studio-ops/panel');
  await expect(page).toHaveURL(/\/\-\/studio-ops$/);

  await page.getByLabel("Nom d'utilisateur").fill(ADMIN_LOGIN);
  await page.getByLabel('Mot de passe').fill(ADMIN_KEY);
  await page.getByRole('button', { name: 'Se connecter' }).click();

  await expect(page).toHaveURL(/\/\-\/studio-ops\/panel$/);
  await expect(page.getByRole('heading', { name: 'Édition de listes de vocabulaire' })).toBeVisible();

  const hasValidSession = await page.evaluate((key) => {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) {
      return false;
    }

    const parsed = JSON.parse(raw);
    return Number.isFinite(parsed.expiresAtMs) && parsed.expiresAtMs > Date.now();
  }, SESSION_KEY);
  expect(hasValidSession).toBe(true);

  await page.evaluate((key) => {
    window.sessionStorage.setItem(key, JSON.stringify({ expiresAtMs: Date.now() - 1 }));
  }, SESSION_KEY);

  await page.goto('/math');
  await page.goto('/-/studio-ops/panel');
  await expect(page).toHaveURL(/\/\-\/studio-ops$/);
});

test('admin login accessibility: labels and keyboard focus', async ({ page }) => {
  await page.goto('/-/studio-ops');

  const usernameInput = page.getByLabel("Nom d'utilisateur");
  const passwordInput = page.getByLabel('Mot de passe');
  const submitButton = page.getByRole('button', { name: 'Se connecter' });

  await expect(usernameInput).toBeVisible();
  await expect(passwordInput).toBeVisible();
  await expect(submitButton).toBeVisible();

  await usernameInput.focus();
  await expect(usernameInput).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(passwordInput).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(submitButton).toBeFocused();
});

test('admin login accessibility: blocked state disables controls after max attempts', async ({ page }) => {
  await page.goto('/-/studio-ops');

  const usernameInput = page.getByLabel("Nom d'utilisateur");
  const passwordInput = page.getByLabel('Mot de passe');
  const submitButton = page.getByRole('button', { name: 'Se connecter' });
  const statusMessage = page.locator('.status-error');

  for (let i = 0; i < 3; i += 1) {
    await usernameInput.fill('wrong-user');
    await passwordInput.fill('wrong-pass');
    await submitButton.click();
  }

  await expect(statusMessage).toContainText('Tentatives restantes: 0.');
  await expect(statusMessage).toContainText(/Réessaie dans \d+s\./);

  await expect(usernameInput).toBeDisabled();
  await expect(passwordInput).toBeDisabled();
  await expect(submitButton).toBeDisabled();
});
