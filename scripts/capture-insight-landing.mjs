import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { ASTRO_BIN, ROOT_DIR } from "./workspace-utils.mjs";

const ADMIN_CAPTURES_DIR = path.join(ROOT_DIR, "apps", "admin", "public", "insight-captures");

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const useCleanPreview = process.argv.includes("--clean") || process.env.INSIGHT_CLEAN === "1";
const previewPort = Number(process.env.INSIGHT_PREVIEW_PORT ?? "4179");
const baseUrl = (
  process.env.INSIGHT_BASE_URL ??
  (useCleanPreview ? `http://127.0.0.1:${previewPort}` : "http://127.0.0.1:4321")
).replace(/\/$/, "");

/** Une capture = un viewport (pas de pleine page) → tarif Insight standard. */
const VIEWPORTS_FIXED = [
  { suffix: "desktop", width: 1440, height: 900 },
  { suffix: "mobile", width: 390, height: 844 },
];

const LOCALES = ["fr", "en"];

const SECTIONS = [
  { key: "hero", selector: "section.hero-bg" },
  { key: "quiz", selector: "#quiz" },
  { key: "features", selector: "#features" },
  { key: "waitlist", selector: "#notify" },
];

const artifactDir = path.join(repoRoot, "artifacts", "insight");
const adminPublicDir = ADMIN_CAPTURES_DIR;

const HIDE_DEVTOOLS_CSS = `
  astro-dev-toolbar { display: none !important; }
`;

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: ROOT_DIR,
      stdio: "inherit",
      shell: process.platform === "win32",
      ...options,
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
    });
  });
}

async function waitForServer(url, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) }).catch(() => null);
    if (response?.ok) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Site inaccessible : ${url}`);
}

function startPreviewServer() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        ASTRO_BIN,
        "preview",
        "--root",
        "apps/web",
        "--host",
        "127.0.0.1",
        "--port",
        String(previewPort),
      ],
      {
        cwd: ROOT_DIR,
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, NODE_ENV: "production" },
      },
    );

    let settled = false;
    const finish = (error) => {
      if (settled) return;
      settled = true;
      if (error) reject(error);
      else resolve(child);
    };

    child.on("error", finish);
    child.on("exit", (code) => {
      if (!settled && code !== 0) {
        finish(new Error(`astro preview exited with ${code}`));
      }
    });

    void waitForServer(`${baseUrl}/fr/`, 120_000)
      .then(() => finish())
      .catch(finish);
  });
}

function clearPngOutputs() {
  for (const dir of [artifactDir, adminPublicDir]) {
    fs.mkdirSync(dir, { recursive: true });
    for (const name of fs.readdirSync(dir)) {
      if (name.endsWith(".png")) {
        fs.unlinkSync(path.join(dir, name));
      }
    }
  }
}

async function preparePage(page) {
  await page.addStyleTag({ content: HIDE_DEVTOOLS_CSS });
}

async function waitForLandingReady(page) {
  await page.waitForFunction(
    () => {
      const tagline = document.querySelector('[data-i18n="hero_tagline"]');
      const quizHeading = document.querySelector("#quizTitleHeadline");
      const titleScreen = document.querySelector("#quizTitleScreen");
      const titleHeadline = document.querySelector("#quizTitleHeadline");
      const startBtn = document.querySelector("#startBtn");
      const diffCards = document.querySelectorAll("#diffGrid .diff-card").length;
      const featureCard = document.querySelector("#features .feature-card");
      const emailInput = document.querySelector("#notify #emailInput");

      const hasHero = Boolean(tagline?.textContent?.trim());
      const hasQuizIntro = Boolean(quizHeading?.textContent?.trim());
      const dailyReady =
        titleScreen instanceof HTMLElement &&
        !titleScreen.hidden &&
        Boolean(titleHeadline?.textContent?.trim()) &&
        Boolean(startBtn?.textContent?.trim());
      const arcadeReady = diffCards >= 4;
      const hasFeatures = Boolean(featureCard?.textContent?.trim());
      const hasWaitlist = emailInput instanceof HTMLInputElement;

      return hasHero && hasQuizIntro && (dailyReady || arcadeReady) && hasFeatures && hasWaitlist;
    },
    { timeout: 45_000 },
  );

  await page.evaluate(() => {
    document.querySelectorAll(".reveal").forEach((element) => {
      element.classList.add("visible");
    });
  });
}

function writeManifest(files) {
  const manifest = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    mode: "viewport-sections",
    insightNote:
      "Upload une image par section (pas de PNG pleine page) pour éviter le surcoût Insight « Long image ».",
    sections: SECTIONS.map((section) => section.key),
    files: [...files].sort(),
  };
  fs.writeFileSync(
    path.join(adminPublicDir, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
}

async function captureSectionViewport(page, selector) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: "visible", timeout: 15_000 });
  await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
}

async function captureAll(previewChild) {
  await waitForServer(`${baseUrl}/fr/`, 10_000);
  clearPngOutputs();

  const browser = await chromium.launch();
  const capturedFiles = [];
  try {
    for (const locale of LOCALES) {
      for (const viewport of VIEWPORTS_FIXED) {
        const page = await browser.newPage({
          viewport: { width: viewport.width, height: viewport.height },
        });
        await preparePage(page);
        const url = `${baseUrl}/${locale}/`;
        await page.goto(url, { waitUntil: "load", timeout: 90_000 });
        await waitForLandingReady(page);

        for (const section of SECTIONS) {
          await captureSectionViewport(page, section.selector);
          const filename = `${locale}-${viewport.suffix}-${section.key}.png`;
          const artifactPath = path.join(artifactDir, filename);
          await page.screenshot({ path: artifactPath, fullPage: false });
          fs.copyFileSync(artifactPath, path.join(adminPublicDir, filename));
          capturedFiles.push(filename);
          console.log(`OK ${filename} ← ${section.key} (${viewport.width}×${viewport.height})`);
        }

        await page.close();
      }
    }
  } finally {
    await browser.close();
    if (previewChild) {
      previewChild.kill("SIGTERM");
    }
  }

  writeManifest(capturedFiles);
  console.log(`\n${capturedFiles.length} captures (viewport / section) : ${adminPublicDir}`);
  console.log("Insight : uploader chaque PNG séparément (pas de long screenshot).");
  console.log("Admin : http://localhost:4322/pilotage/insight/");
}

async function main() {
  let previewChild = null;
  if (useCleanPreview) {
    console.log("Build web + preview (sans barre dev Astro)…");
    await runCommand("npm", ["run", "build:web"]);
    previewChild = await startPreviewServer();
    console.log(`Preview : ${baseUrl}`);
  }

  try {
    await captureAll(previewChild);
  } catch (error) {
    if (previewChild) previewChild.kill("SIGTERM");
    throw error;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
