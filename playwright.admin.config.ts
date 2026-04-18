import path from "node:path";
import { defineConfig } from "@playwright/test";

const repoRoot = path.resolve(".");
const pythonCommand = process.platform === "win32" ? "python" : "python3";

export default defineConfig({
  testDir: ".",
  testMatch: [
    "tests/admin/**/*.spec.ts",
  ],
  fullyParallel: false,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [["list"]],
  use: {
    viewport: { width: 1440, height: 1400 },
    screenshot: "only-on-failure",
    trace: "off",
  },
  webServer: [
    {
      command: `${pythonCommand} -m http.server 4173 --bind 127.0.0.1`,
      cwd: repoRoot,
      url: "http://127.0.0.1:4173/legacy/mvp-index.html",
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: `${pythonCommand} -m http.server 4321 --bind 127.0.0.1`,
      cwd: path.join(repoRoot, "dist", "web"),
      url: "http://127.0.0.1:4321/",
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: `${pythonCommand} -m http.server 4322 --bind 127.0.0.1`,
      cwd: path.join(repoRoot, "dist", "admin"),
      url: "http://127.0.0.1:4322/",
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
});
