import fs from "node:fs/promises";
import path from "node:path";
import type { Locator, Page, TestInfo } from "@playwright/test";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

export const LEGACY_URL = "http://127.0.0.1:4173/legacy/mvp-index.html";
export const ASTRO_URL = "http://127.0.0.1:4174/";
const WRITE_VISUAL_ARTIFACTS = process.env.PW_DEBUG_ARTIFACTS === "1";

export type SectionName =
  | "nav"
  | "hero"
  | "top-ad"
  | "features"
  | "quiz"
  | "mid-ad"
  | "notify"
  | "footer";

export interface SectionSpec {
  name: SectionName;
  maxDiffRatio: number;
  getLocator: (page: Page) => Locator;
}

export interface TypographySpec {
  name: string;
  selector: string;
}

export const SECTIONS: SectionSpec[] = [
  { name: "nav", maxDiffRatio: 0.002, getLocator: (page) => page.locator("nav") },
  { name: "hero", maxDiffRatio: 0.002, getLocator: (page) => page.locator("section.hero-bg") },
  { name: "top-ad", maxDiffRatio: 0.002, getLocator: (page) => page.locator(".ad-placeholder").nth(0) },
  { name: "features", maxDiffRatio: 0.0025, getLocator: (page) => page.locator("#features") },
  { name: "quiz", maxDiffRatio: 0.0025, getLocator: (page) => page.locator("#quiz") },
  { name: "mid-ad", maxDiffRatio: 0.002, getLocator: (page) => page.locator(".ad-placeholder").nth(1) },
  { name: "notify", maxDiffRatio: 0.0025, getLocator: (page) => page.locator("#notify") },
  { name: "footer", maxDiffRatio: 0.002, getLocator: (page) => page.locator("footer") },
];

export const TYPOGRAPHY_SPECS: TypographySpec[] = [
  { name: "brand", selector: "nav .glow-violet" },
  { name: "hero-title", selector: "h1.font-pixel" },
  { name: "hero-tagline", selector: "[data-i18n='hero_tagline']" },
  { name: "hero-sub", selector: "[data-i18n='hero_sub']" },
  { name: "hero-cta", selector: ".cta-btn" },
  { name: "quiz-title", selector: "#quiz h2" },
  { name: "email-title", selector: "#notify h2" },
];

interface VisualDiffMetrics {
  diffPixels: number;
  diffRatio: number;
  width: number;
  height: number;
  legacyWidth: number;
  legacyHeight: number;
  astroWidth: number;
  astroHeight: number;
  legacyPath: string;
  astroPath: string;
  diffPath: string;
}

interface TypographySnapshot {
  text: string;
  fontFamily: string;
  fontWeight: string;
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  textTransform: string;
}

export async function preparePage(page: Page, url: string): Promise<void> {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => {
      const badge = document.querySelector("[data-i18n='hero_badge']");
      return Boolean(badge?.textContent?.trim().length);
    },
    undefined,
    { timeout: 15_000 },
  );
  await page.waitForTimeout(750);
  await page.evaluate(async () => {
    if ("fonts" in document) {
      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => window.setTimeout(resolve, 2_000)),
      ]);
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(150);
}

export async function compareSectionShots(
  legacyPage: Page,
  astroPage: Page,
  section: SectionSpec,
  testInfo: TestInfo,
): Promise<VisualDiffMetrics> {
  const legacyLocator = section.getLocator(legacyPage);
  const astroLocator = section.getLocator(astroPage);

  await legacyLocator.scrollIntoViewIfNeeded();
  await astroLocator.scrollIntoViewIfNeeded();
  await legacyPage.waitForTimeout(250);
  await astroPage.waitForTimeout(250);

  const legacyShot = await legacyLocator.screenshot({ animations: "disabled" });
  const astroShot = await astroLocator.screenshot({ animations: "disabled" });

  return writeDiffArtifacts(section, legacyShot, astroShot, testInfo);
}

export async function captureTypography(page: Page, selector: string): Promise<TypographySnapshot> {
  const locator = page.locator(selector).first();
  await locator.scrollIntoViewIfNeeded();
  return locator.evaluate((element) => {
    const style = window.getComputedStyle(element);
    const text = element.textContent?.replace(/\s+/g, " ").trim() ?? "";
    return {
      text,
      fontFamily: style.fontFamily,
      fontWeight: style.fontWeight,
      fontSize: style.fontSize,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
      textTransform: style.textTransform,
    };
  });
}

export function normalizeFontFamily(fontFamily: string): string {
  return fontFamily.replaceAll('"', "").replaceAll(" ", "").toLowerCase();
}

async function writeDiffArtifacts(
  section: SectionSpec,
  legacyBuffer: Buffer,
  astroBuffer: Buffer,
  testInfo: TestInfo,
): Promise<VisualDiffMetrics> {
  const legacyPng = PNG.sync.read(legacyBuffer);
  const astroPng = PNG.sync.read(astroBuffer);

  const width = Math.max(legacyPng.width, astroPng.width);
  const height = Math.max(legacyPng.height, astroPng.height);

  const expandedLegacy = new PNG({ width, height });
  const expandedAstro = new PNG({ width, height });
  const diff = new PNG({ width, height });

  PNG.bitblt(legacyPng, expandedLegacy, 0, 0, legacyPng.width, legacyPng.height, 0, 0);
  PNG.bitblt(astroPng, expandedAstro, 0, 0, astroPng.width, astroPng.height, 0, 0);

  const diffPixels = pixelmatch(
    expandedLegacy.data,
    expandedAstro.data,
    diff.data,
    width,
    height,
    { threshold: 0.1 },
  );
  const diffRatio = diffPixels / (width * height);

  let legacyPath = "";
  let astroPath = "";
  let diffPath = "";
  if (WRITE_VISUAL_ARTIFACTS || diffRatio > section.maxDiffRatio) {
    const visualDir = path.join(testInfo.outputDir, "visual");
    await fs.mkdir(visualDir, { recursive: true });
    legacyPath = path.join(visualDir, `${section.name}-legacy.png`);
    astroPath = path.join(visualDir, `${section.name}-astro.png`);
    diffPath = path.join(visualDir, `${section.name}-diff.png`);

    await fs.writeFile(legacyPath, legacyBuffer);
    await fs.writeFile(astroPath, astroBuffer);
    await fs.writeFile(diffPath, PNG.sync.write(diff));
  }

  return {
    diffPixels,
    diffRatio,
    width,
    height,
    legacyWidth: legacyPng.width,
    legacyHeight: legacyPng.height,
    astroWidth: astroPng.width,
    astroHeight: astroPng.height,
    legacyPath,
    astroPath,
    diffPath,
  };
}
