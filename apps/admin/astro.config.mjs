// @ts-nocheck — plugin Vite middleware non typé ici.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(appDir, "../..");
const insightCapturesDir = path.join(repoRoot, "tmp", "captures", "insight");

const MIME_BY_EXT = {
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
};

/** Sert les captures Insight depuis tmp/ en dev et preview (admin statique). */
function insightCapturesDevPlugin() {
  const handler = (req, res, next) => {
    const url = req.url ?? "";
    if (!url.startsWith("/insight-captures")) return next();

    const rel = decodeURIComponent(url.replace(/^\/insight-captures\/?/, "").split("?")[0] || "");
    if (!rel || rel.includes("..") || rel.includes("\\")) {
      res.statusCode = 400;
      res.end();
      return;
    }

    const filePath = path.join(insightCapturesDir, rel);
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      res.statusCode = 404;
      res.end();
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.setHeader("Content-Type", MIME_BY_EXT[ext] ?? "application/octet-stream");
    fs.createReadStream(filePath).pipe(res);
  };

  return {
    name: "insight-captures-dev",
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig({
  output: "static",
  root: appDir,
  srcDir: path.join(appDir, "src"),
  publicDir: path.join(appDir, "public"),
  outDir: path.join(repoRoot, "dist", "admin"),
  vite: {
    plugins: [tailwindcss(), insightCapturesDevPlugin()],
  },
});
