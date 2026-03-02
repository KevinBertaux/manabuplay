import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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

test('a11y smoke: math', async ({ page }) => {
  await expectNoSeriousA11yViolations(page, '/math');
});

test('a11y smoke: vocab', async ({ page }) => {
  await expectNoSeriousA11yViolations(page, '/vocab');
});

test('a11y smoke: studio ops login', async ({ page }) => {
  await expectNoSeriousA11yViolations(page, '/-/studio-ops');
});
