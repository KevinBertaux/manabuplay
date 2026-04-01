import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "@playwright/test";

const repoRoot = path.resolve(".");
const browserCandidates = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];
const executablePath = browserCandidates.find((candidate) => fs.existsSync(candidate));

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    viewport: { width: 1440, height: 2200 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    launchOptions: executablePath
      ? {
          executablePath,
        }
      : undefined,
  },
  webServer: [
    {
      command: "python -m http.server 4173 --bind 127.0.0.1",
      cwd: repoRoot,
      url: "http://127.0.0.1:4173/legacy/mvp-index.html",
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: "python -m http.server 4174 --bind 127.0.0.1",
      cwd: path.join(repoRoot, "dist"),
      url: "http://127.0.0.1:4174/",
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
});
