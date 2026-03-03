import { expect, test } from '@playwright/test';

test.describe('@visual visual regression smoke', () => {
  test.beforeEach(async () => {
    test.skip(
      process.env.PW_VISUAL !== '1',
      'Visual regression tests run only in dedicated visual workflow.'
    );
  });

  test.beforeEach(async ({ page, browserName }) => {
    test.skip(
      browserName !== 'chromium' || test.info().project.name !== 'desktop-chromium',
      'Visual baselines are tracked on desktop Chromium only.'
    );
    await page.addStyleTag({
      content: `
        *,
        *::before,
        *::after {
          animation: none !important;
          transition: none !important;
          caret-color: transparent !important;
        }
      `,
    });
  });

  test('home visual baseline', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('home.png', { fullPage: true, maxDiffPixelRatio: 0.02 });
  });

  test('math visual baseline', async ({ page }) => {
    await page.goto('/math/multiplications');
    await expect(page).toHaveScreenshot('math.png', { fullPage: true, maxDiffPixelRatio: 0.02 });
  });

  test('english visual baseline', async ({ page }) => {
    await page.goto('/languages/english');
    await expect(page).toHaveScreenshot('english.png', { fullPage: true, maxDiffPixelRatio: 0.02 });
  });

  test('admin login visual baseline', async ({ page }) => {
    await page.goto('/-/studio-ops');
    await expect(page).toHaveScreenshot('studio-ops-login.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});
