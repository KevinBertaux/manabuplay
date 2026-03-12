const consentPayload = {
  version: '2026-03-10',
  status: 'granted',
  selections: {
    necessary: true,
    analytics: true,
    ads: true,
  },
  updatedAt: '2026-03-12T00:00:00.000Z',
};

import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.addInitScript((payload) => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.localStorage.setItem('manabuplay_consent', JSON.stringify(payload));
  }, consentPayload);
});

async function expectNoSeriousA11yViolations(page, path) {
  await page.goto(path);
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  const seriousOrCritical = accessibilityScanResults.violations.filter((violation) =>
    ['serious', 'critical'].includes(violation.impact || '')
  );

  expect(seriousOrCritical, `A11y violations on ${path}`).toEqual([]);
}

test('a11y smoke: home', async ({ page }) => {
  await expectNoSeriousA11yViolations(page, '/');
});

test('a11y smoke: math multiplications', async ({ page }) => {
  await expectNoSeriousA11yViolations(page, '/math/multiplications');
});

test('a11y smoke: math hub', async ({ page }) => {
  await expectNoSeriousA11yViolations(page, '/math');
});

test('a11y smoke: english module', async ({ page }) => {
  await expectNoSeriousA11yViolations(page, '/languages/english');
});

test('a11y smoke: languages hub', async ({ page }) => {
  await expectNoSeriousA11yViolations(page, '/languages');
});

test('a11y smoke: studio ops login', async ({ page }) => {
  await expectNoSeriousA11yViolations(page, '/-/studio-ops');
});
