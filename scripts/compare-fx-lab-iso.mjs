import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const root = process.cwd();
const webDistDir = path.join(root, "dist", "web");
const adminDistDir = path.join(root, "dist", "admin");
const outDir = path.join(root, ".codex-temp", "fx-lab-iso");
const reportPath = path.join(outDir, "report.json");
const webBaseUrl = "http://127.0.0.1:4274";
const adminBaseUrl = "http://127.0.0.1:4275";

await fs.mkdir(outDir, { recursive: true });

const webServer = spawn("python", ["-m", "http.server", "4274", "--bind", "127.0.0.1"], {
  cwd: webDistDir,
  stdio: "ignore",
});

const adminServer = spawn("python", ["-m", "http.server", "4275", "--bind", "127.0.0.1"], {
  cwd: adminDistDir,
  stdio: "ignore",
});

try {
  await Promise.all([waitForServer(`${webBaseUrl}/`), waitForServer(`${adminBaseUrl}/`)]);

  const browser = await chromium.launch({ headless: true });
  try {
    const sitePage = await browser.newPage({ viewport: { width: 1440, height: 2200 } });
    const heroPage = await browser.newPage({ viewport: { width: 1440, height: 2200 } });
    const quizPage = await browser.newPage({ viewport: { width: 1440, height: 2200 } });

    await Promise.all([
      preparePage(sitePage, `${webBaseUrl}/`, "[data-i18n='hero_badge']"),
      preparePage(heroPage, `${adminBaseUrl}/design/references/hero/`, "[data-i18n='hero_badge']"),
      preparePage(quizPage, `${adminBaseUrl}/design/references/quiz/#quiz`, "#diffGrid .diff-card"),
    ]);

    const results = [
      await compareSection("hero", sitePage, heroPage, "section.hero-bg"),
      await compareSection("quiz", sitePage, quizPage, "#quiz"),
    ];

    await fs.writeFile(reportPath, JSON.stringify({ results }, null, 2), "utf8");

    const failed = results.find((result) => result.diffRatio !== 0);
    if (failed) {
      throw new Error(`${failed.name} is not ISO. diffRatio=${failed.diffRatio}`);
    }

    console.log("FX lab ISO compare OK:", results.map((result) => `${result.name}=0`).join(", "));
  } finally {
    await browser.close();
  }
} finally {
  if (!webServer.killed) {
    webServer.kill("SIGKILL");
  }
  if (!adminServer.killed) {
    adminServer.kill("SIGKILL");
  }
}

async function waitForServer(url, attempts = 40) {
  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Server did not start: ${url}`);
}

async function preparePage(page, url, readySelector) {
  await page.addInitScript(() => {
    window.localStorage.setItem("mp_lang", JSON.stringify("en"));
  });
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.addStyleTag({
    content: `
      *,
      *::before,
      *::after {
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
      }
    `,
  });
  await page.waitForFunction(
    (selector) => {
      const node = document.querySelector(selector);
      return Boolean(node?.textContent?.trim().length);
    },
    readySelector,
    { timeout: 15_000 },
  );
  await page.evaluate(async () => {
    if ("fonts" in document) {
      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => window.setTimeout(resolve, 2_000)),
      ]);
    }
  });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(750);
}

async function compareSection(name, sitePage, previewPage, selector) {
  const siteLocator = sitePage.locator(selector).first();
  const previewLocator = previewPage.locator(selector).first();

  await siteLocator.scrollIntoViewIfNeeded();
  await previewLocator.scrollIntoViewIfNeeded();

  const siteBuffer = await siteLocator.screenshot({ animations: "disabled" });
  const previewBuffer = await previewLocator.screenshot({ animations: "disabled" });

  const sitePath = path.join(outDir, `${name}-site.png`);
  const previewPath = path.join(outDir, `${name}-preview.png`);
  const diffPath = path.join(outDir, `${name}-diff.png`);

  await fs.writeFile(sitePath, siteBuffer);
  await fs.writeFile(previewPath, previewBuffer);

  const sitePng = PNG.sync.read(siteBuffer);
  const previewPng = PNG.sync.read(previewBuffer);
  const width = Math.max(sitePng.width, previewPng.width);
  const height = Math.max(sitePng.height, previewPng.height);
  const expandedSite = new PNG({ width, height });
  const expandedPreview = new PNG({ width, height });
  const diff = new PNG({ width, height });

  PNG.bitblt(sitePng, expandedSite, 0, 0, sitePng.width, sitePng.height, 0, 0);
  PNG.bitblt(previewPng, expandedPreview, 0, 0, previewPng.width, previewPng.height, 0, 0);

  const diffPixels = pixelmatch(expandedSite.data, expandedPreview.data, diff.data, width, height, {
    threshold: 0.1,
  });
  const diffRatio = diffPixels / (width * height);

  await fs.writeFile(diffPath, PNG.sync.write(diff));

  return {
    name,
    diffPixels,
    diffRatio,
    width,
    height,
    sitePath,
    previewPath,
    diffPath,
  };
}
