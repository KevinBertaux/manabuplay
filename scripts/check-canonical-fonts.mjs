import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const scriptsDir = path.dirname(currentFile);
const repoRoot = path.resolve(scriptsDir, "..");

const scanTargets = ["apps", "shared", "tailwind.config.cjs"];

const ignoredDirectories = new Set([".astro", "dist", "node_modules"]);
const scannedExtensions = new Set([".astro", ".css", ".js", ".mjs", ".ts", ".cjs"]);
const violations = [];

function normalizePath(filePath) {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, "/");
}

function collectFiles(targetPath) {
  const resolvedPath = path.join(repoRoot, targetPath);
  if (!fs.existsSync(resolvedPath)) return [];

  const stat = fs.statSync(resolvedPath);
  if (stat.isFile()) return [resolvedPath];

  const files = [];
  for (const entry of fs.readdirSync(resolvedPath, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;

    const nextPath = path.join(resolvedPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(path.relative(repoRoot, nextPath)));
      continue;
    }

    if (scannedExtensions.has(path.extname(entry.name))) {
      files.push(nextPath);
    }
  }

  return files;
}

for (const target of scanTargets) {
  for (const filePath of collectFiles(target)) {
    const relativePath = normalizePath(filePath);
    const source = fs.readFileSync(filePath, "utf8");
    const count = (source.match(/\bRajdhani\b/g) || []).length;

    if (count === 0) continue;

    violations.push({ filePath: relativePath, count });
  }
}

console.log("Canonical fonts audit");

if (violations.length > 0) {
  for (const violation of violations) {
    console.error(`- ${violation.filePath}: Rajdhani usage (${violation.count})`);
  }
  console.error("\nCanonical font violations detected.");
  process.exit(1);
}

console.log("- no Rajdhani usage in rendered app/shared code");
