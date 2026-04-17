// @ts-check
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(appDir, "../..");

export default defineConfig({
  root: appDir,
  srcDir: path.join(appDir, "src"),
  publicDir: path.join(appDir, "public"),
  outDir: path.join(repoRoot, "dist", "admin"),
  vite: {
    plugins: [tailwindcss()],
  },
});
