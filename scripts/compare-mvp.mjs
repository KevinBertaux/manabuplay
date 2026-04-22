import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const root = process.cwd();
const tempDir = path.join(root, ".codex-temp", "visual-compare");
const reportPath = path.join(tempDir, "report.json");
const browserCandidates = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];
const executablePath = browserCandidates.find((candidate) => existsSync(candidate));

const sections = [
  { name: "nav", maxDiffRatio: 0.002, selector: "nav" },
  { name: "hero", maxDiffRatio: 0.002, selector: "section.hero-bg" },
  { name: "top-ad", maxDiffRatio: 0.002, selector: ".ad-placeholder", index: 0 },
  { name: "features", maxDiffRatio: 0.0025, selector: "#features" },
  { name: "quiz", maxDiffRatio: 0.0025, selector: "#quiz" },
  { name: "mid-ad", maxDiffRatio: 0.002, selector: ".ad-placeholder", index: 1 },
  { name: "notify", maxDiffRatio: 0.0025, selector: "#notify" },
  { name: "footer", maxDiffRatio: 0.002, selector: "footer" },
];

const typographySpecs = [
  { name: "brand", selector: "nav .glow-violet" },
  { name: "hero-title", selector: "h1.font-pixel" },
  { name: "hero-tagline", selector: "[data-i18n='hero_tagline']" },
  { name: "hero-sub", selector: "[data-i18n='hero_sub']" },
  { name: "hero-cta", selector: ".cta-btn" },
  { name: "quiz-title", selector: "#quiz h2" },
  { name: "email-title", selector: "#notify h2" },
];

await fs.mkdir(tempDir, { recursive: true });

const legacyServer = startServer(root, 4173);
const astroServer = startServer(path.join(root, "dist"), 4174);

try {
  await waitForServer("http://127.0.0.1:4173/legacy/mvp-index.html");
  await waitForServer("http://127.0.0.1:4174/");

  const browserServer = await chromium.launchServer({
    headless: true,
    executablePath,
  });
  const browser = await chromium.connect(browserServer.wsEndpoint());
  const browserProcess = browserServer.process();

  try {
    const legacyPage = await browser.newPage({ viewport: { width: 1440, height: 2200 } });
    const astroPage = await browser.newPage({ viewport: { width: 1440, height: 2200 } });

    await Promise.all([
      preparePage(legacyPage, "http://127.0.0.1:4173/legacy/mvp-index.html"),
      preparePage(astroPage, "http://127.0.0.1:4174/"),
    ]);

    const visualResults = [];
    for (const section of sections) {
      const result = await compareSection(legacyPage, astroPage, section);
      visualResults.push(result);
    }

    const typographyResults = [];
    for (const spec of typographySpecs) {
      const legacyTypography = await captureTypography(legacyPage, spec.selector);
      const astroTypography = await captureTypography(astroPage, spec.selector);
      typographyResults.push({
        name: spec.name,
        legacy: legacyTypography,
        astro: astroTypography,
        textEqual: legacyTypography.text === astroTypography.text,
        fontFamilyEqual:
          normalizeFontFamily(legacyTypography.fontFamily) ===
          normalizeFontFamily(astroTypography.fontFamily),
        fontWeightEqual: legacyTypography.fontWeight === astroTypography.fontWeight,
        fontSizeEqual: legacyTypography.fontSize === astroTypography.fontSize,
        lineHeightEqual: legacyTypography.lineHeight === astroTypography.lineHeight,
        letterSpacingEqual: legacyTypography.letterSpacing === astroTypography.letterSpacing,
      });
    }

    await fs.writeFile(
      reportPath,
      JSON.stringify(
        {
          visualResults,
          typographyResults,
        },
        null,
        2,
      ),
      "utf8",
    );
  } finally {
    if (browserProcess && !browserProcess.killed) {
      browserProcess.kill("SIGKILL");
    }
  }
} finally {
  stopServer(legacyServer);
  stopServer(astroServer);
  process.exit(0);
}

function startServer(cwd, port) {
  return spawn("python", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], {
    cwd,
    stdio: "ignore",
    detached: false,
  });
}

function stopServer(server) {
  if (!server.killed) {
    server.kill("SIGKILL");
  }
}

async function waitForServer(url, attempts = 40) {
  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Server did not start: ${url}`);
}

async function preparePage(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
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
}

async function compareSection(legacyPage, astroPage, section) {
  const legacyLocator = getLocator(legacyPage, section.selector, section.index);
  const astroLocator = getLocator(astroPage, section.selector, section.index);

  await legacyLocator.scrollIntoViewIfNeeded();
  await astroLocator.scrollIntoViewIfNeeded();
  await legacyPage.waitForTimeout(250);
  await astroPage.waitForTimeout(250);

  const legacyBuffer = await legacyLocator.screenshot({ animations: "disabled" });
  const astroBuffer = await astroLocator.screenshot({ animations: "disabled" });

  const legacyPng = PNG.sync.read(legacyBuffer);
  const astroPng = PNG.sync.read(astroBuffer);
  const width = Math.max(legacyPng.width, astroPng.width);
  const height = Math.max(legacyPng.height, astroPng.height);
  const expandedLegacy = new PNG({ width, height });
  const expandedAstro = new PNG({ width, height });
  const diff = new PNG({ width, height });

  PNG.bitblt(legacyPng, expandedLegacy, 0, 0, legacyPng.width, legacyPng.height, 0, 0);
  PNG.bitblt(astroPng, expandedAstro, 0, 0, astroPng.width, astroPng.height, 0, 0);

  const diffPixels = pixelmatch(expandedLegacy.data, expandedAstro.data, diff.data, width, height, {
    threshold: 0.1,
  });
  const diffRatio = diffPixels / (width * height);

  const legacyPath = path.join(tempDir, `${section.name}-legacy.png`);
  const astroPath = path.join(tempDir, `${section.name}-astro.png`);
  const diffPath = path.join(tempDir, `${section.name}-diff.png`);

  await fs.writeFile(legacyPath, legacyBuffer);
  await fs.writeFile(astroPath, astroBuffer);
  await fs.writeFile(diffPath, PNG.sync.write(diff));

  return {
    name: section.name,
    maxDiffRatio: section.maxDiffRatio,
    diffPixels,
    diffRatio,
    legacyPath,
    astroPath,
    diffPath,
    legacySize: { width: legacyPng.width, height: legacyPng.height },
    astroSize: { width: astroPng.width, height: astroPng.height },
  };
}

function getLocator(page, selector, index) {
  const locator = page.locator(selector);
  return typeof index === "number" ? locator.nth(index) : locator.first();
}

async function captureTypography(page, selector) {
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

function normalizeFontFamily(fontFamily) {
  return fontFamily.replaceAll('"', "").replaceAll(" ", "").toLowerCase();
}
