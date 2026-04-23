import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const scriptsDir = path.dirname(currentFile);
const repoRoot = path.resolve(scriptsDir, "..");

const scanTargets = [
  "apps",
  "shared",
  "tests",
  "scripts",
  "playwright.web.config.ts",
  "playwright.admin.config.ts",
  "README.md",
];

const bannedPatterns = [
  {
    label: "legacy MVP source id",
    pattern: /legacy-mvp/g,
  },
  {
    label: "legacy generated catalog snapshot",
    pattern: /raw\.generated(?:\.js)?/g,
  },
  {
    label: "legacy MVP constants",
    pattern: /\bMVP_(?:QUIZ_DATA|LANG|DIFFICULTIES)\b/g,
  },
  {
    label: "old parity reference path",
    pattern: /legacy\/mvp-index\.html/g,
  },
  {
    label: "old visual compare script name",
    pattern: /compare-mvp\.mjs/g,
  },
];

const violations = [];

function collectFiles(targetPath) {
  const resolvedPath = path.join(repoRoot, targetPath);
  if (!fs.existsSync(resolvedPath)) {
    return [];
  }

  const stat = fs.statSync(resolvedPath);
  if (stat.isFile()) {
    return [resolvedPath];
  }

  const files = [];
  for (const entry of fs.readdirSync(resolvedPath, { withFileTypes: true })) {
    const nextPath = path.join(resolvedPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(path.relative(repoRoot, nextPath)));
      continue;
    }
    files.push(nextPath);
  }

  return files;
}

for (const target of scanTargets) {
  for (const filePath of collectFiles(target)) {
    if (path.basename(filePath) === "check-canonical-boundaries.mjs") {
      continue;
    }
    const source = fs.readFileSync(filePath, "utf8");
    for (const { label, pattern } of bannedPatterns) {
      const matches = source.match(pattern);
      if (!matches) {
        continue;
      }
      violations.push({
        filePath: path.relative(repoRoot, filePath),
        label,
        count: matches.length,
      });
    }
  }
}

console.log("Canonical boundary audit");

if (violations.length > 0) {
  for (const violation of violations) {
    console.error(`- ${violation.filePath}: ${violation.label} (${violation.count})`);
  }
  console.error("\nCanonical boundary violations detected.");
  process.exit(1);
}

console.log("- no legacy MVP markers found in active code paths");
