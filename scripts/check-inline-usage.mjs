import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const scriptsDir = path.dirname(currentFile);
const repoRoot = path.resolve(scriptsDir, "..");
const baselinePath = path.join(scriptsDir, "inline-usage-baseline.json");
const scanRoots = [
  path.join(repoRoot, "apps", "web", "src"),
  path.join(repoRoot, "apps", "admin", "src"),
];

const counters = {
  styleAttributes: 0,
  inlineEventHandlers: 0,
  inlineScripts: 0,
  styleBlocks: 0,
};

function walkDirectory(directoryPath) {
  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    const nextPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      walkDirectory(nextPath);
      continue;
    }

    if (!/\.(astro|ts|js|mjs)$/i.test(entry.name)) {
      continue;
    }

    const source = fs.readFileSync(nextPath, "utf8");
    counters.styleAttributes += (source.match(/\bstyle=/g) || []).length;
    counters.inlineEventHandlers += (source.match(/\bon[a-z]+=/g) || []).length;
    counters.inlineScripts += (
      source.match(/<script\b(?=[^>]*(?:set:html=|is:inline))(?![^>]*\bsrc=)[^>]*>/g) || []
    ).length;
    counters.styleBlocks += (source.match(/<style\b/g) || []).length;
  }
}

for (const scanRoot of scanRoots) {
  walkDirectory(scanRoot);
}

const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
const regressions = Object.entries(counters).filter(([key, value]) => value > baseline[key]);

console.log("Inline usage audit");
for (const [key, value] of Object.entries(counters)) {
  const target = baseline[key];
  const delta = value - target;
  const sign = delta > 0 ? "+" : "";
  console.log(`- ${key}: ${value} (baseline ${target}, delta ${sign}${delta})`);
}

if (regressions.length > 0) {
  console.error("\nInline usage regression detected.");
  process.exit(1);
}

console.log("\nInline usage ratchet OK.");
