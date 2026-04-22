import { expect, test } from "@playwright/test";
import {
  ASTRO_HOME_URL,
  LEGACY_URL,
  SECTIONS,
  TYPOGRAPHY_SPECS,
  captureTypography,
  compareSectionShots,
  normalizeFontFamily,
  preparePage,
} from "../helpers/visual";

const RUN_LEGACY_VISUAL_PARITY = process.env.PW_LEGACY_VISUAL_PARITY === "1";

test.describe("Legacy MVP vs Astro MVP", () => {
  test.skip(
    !RUN_LEGACY_VISUAL_PARITY,
    "Legacy parity is opt-in now that the public landing intentionally diverges from the MVP reference.",
  );

  test("section-by-section visual parity", async ({ browser }, testInfo) => {
    const legacyPage = await browser.newPage();
    const astroPage = await browser.newPage();

    await Promise.all([
      preparePage(legacyPage, LEGACY_URL),
      preparePage(astroPage, ASTRO_HOME_URL),
    ]);

    for (const section of SECTIONS) {
      const metrics = await compareSectionShots(legacyPage, astroPage, section, testInfo);
      await testInfo.attach(`${section.name}-metrics`, {
        body: JSON.stringify(metrics, null, 2),
        contentType: "application/json",
      });

      expect
        .soft(
          metrics.diffRatio,
          `${section.name} diff ratio ${metrics.diffRatio.toFixed(6)} exceeds ${section.maxDiffRatio}. Diff: ${metrics.diffPath}`,
        )
        .toBeLessThanOrEqual(section.maxDiffRatio);
    }
  });

  test("key typography and text parity", async ({ browser }, testInfo) => {
    const legacyPage = await browser.newPage();
    const astroPage = await browser.newPage();

    await Promise.all([
      preparePage(legacyPage, LEGACY_URL),
      preparePage(astroPage, ASTRO_HOME_URL),
    ]);

    for (const spec of TYPOGRAPHY_SPECS) {
      const legacyTypography = await captureTypography(legacyPage, spec.selector);
      const astroTypography = await captureTypography(astroPage, spec.selector);

      await testInfo.attach(`${spec.name}-typography`, {
        body: JSON.stringify({ legacyTypography, astroTypography }, null, 2),
        contentType: "application/json",
      });

      expect.soft(astroTypography.text, `${spec.name} text differs`).toBe(legacyTypography.text);
      expect
        .soft(normalizeFontFamily(astroTypography.fontFamily), `${spec.name} font family differs`)
        .toBe(normalizeFontFamily(legacyTypography.fontFamily));
      expect
        .soft(astroTypography.fontWeight, `${spec.name} font weight differs`)
        .toBe(legacyTypography.fontWeight);
      expect
        .soft(astroTypography.fontSize, `${spec.name} font size differs`)
        .toBe(legacyTypography.fontSize);
      expect
        .soft(astroTypography.lineHeight, `${spec.name} line height differs`)
        .toBe(legacyTypography.lineHeight);
      expect
        .soft(astroTypography.letterSpacing, `${spec.name} letter spacing differs`)
        .toBe(legacyTypography.letterSpacing);
      expect
        .soft(astroTypography.textTransform, `${spec.name} text transform differs`)
        .toBe(legacyTypography.textTransform);
    }
  });
});
