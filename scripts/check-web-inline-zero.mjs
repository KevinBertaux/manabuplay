import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const scriptsDir = path.dirname(currentFile);
const repoRoot = path.resolve(scriptsDir, "..");
const scanRoot = path.join(repoRoot, "apps", "web", "src");

const counters = {
  styleAttributes: 0,
  inlineEventHandlers: 0,
  inlineScripts: 0,
  styleBlocks: 0,
};

const violations = [];

function countMatches(source, pattern) {
  return (source.match(pattern) || []).length;
}

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
    const fileCounters = {
      styleAttributes: countMatches(source, /\bstyle=/g),
      inlineEventHandlers: countMatches(source, /\bon[a-z]+=/g),
      inlineScripts: countMatches(source, /<script\b(?=[^>]*(?:set:html=|is:inline))[^>]*>/g),
      styleBlocks: countMatches(source, /<style\b/g),
    };

    const fileTotal = Object.values(fileCounters).reduce((total, value) => total + value, 0);
    if (fileTotal === 0) {
      continue;
    }

    for (const [key, value] of Object.entries(fileCounters)) {
      counters[key] += value;
    }

    violations.push({
      filePath: path.relative(repoRoot, nextPath).replaceAll(path.sep, "/"),
      counters: fileCounters,
    });
  }
}

walkDirectory(scanRoot);

console.log("Web inline zero audit");
for (const [key, value] of Object.entries(counters)) {
  console.log(`- ${key}: ${value}`);
}

if (violations.length > 0) {
  console.error("\nInline usage is forbidden in apps/web/src.");
  for (const violation of violations) {
    const details = Object.entries(violation.counters)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => `${key}=${value}`)
      .join(", ");
    console.error(`- ${violation.filePath}: ${details}`);
  }
  process.exit(1);
}

console.log("\nWeb inline zero OK.");
