import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const ZERO_SHA = "0000000000000000000000000000000000000000";
const dryRun = process.argv.includes("--dry-run");
const filesArg = process.argv.find((arg) => arg.startsWith("--files="));

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: options.stdio || "pipe",
    shell: options.shell || false,
  });

  if (result.error) {
    if (options.optional) return "";
    throw result.error;
  }

  if (result.status !== 0) {
    if (options.optional) return "";
    const stderr = result.stderr?.trim();
    throw new Error(stderr || `${command} ${args.join(" ")} failed`);
  }

  return result.stdout?.trim() || "";
}

function runGit(args, options = {}) {
  return run("git", args, options);
}

function runNpmScript(scriptName) {
  if (dryRun) {
    console.log(`DRY RUN: npm run ${scriptName}`);
    return;
  }

  console.log(`\n> npm run ${scriptName}`);
  run(
    process.platform === "win32" ? `npm run ${scriptName}` : "npm",
    process.platform === "win32" ? [] : ["run", scriptName],
    {
      shell: process.platform === "win32",
      stdio: "inherit",
    },
  );
}

function normalizePath(filePath) {
  return filePath.replaceAll("\\", "/").trim();
}

function getCliFiles() {
  if (!filesArg) return [];

  return filesArg.slice("--files=".length).split(",").map(normalizePath).filter(Boolean);
}

function getDefaultRemoteRef() {
  const originHead = runGit(["symbolic-ref", "--quiet", "--short", "refs/remotes/origin/HEAD"], {
    optional: true,
  });

  return originHead || "origin/main";
}

function getChangedFiles(localSha, remoteSha) {
  if (!localSha || localSha === ZERO_SHA) return [];

  if (remoteSha && remoteSha !== ZERO_SHA) {
    return runGit(["diff", "--name-only", remoteSha, localSha])
      .split(/\r?\n/)
      .map(normalizePath)
      .filter(Boolean);
  }

  const defaultRemoteRef = getDefaultRemoteRef();
  const mergeBase = runGit(["merge-base", localSha, defaultRemoteRef], { optional: true });

  if (mergeBase) {
    return runGit(["diff", "--name-only", mergeBase, localSha])
      .split(/\r?\n/)
      .map(normalizePath)
      .filter(Boolean);
  }

  return runGit(["diff-tree", "--no-commit-id", "--name-only", "-r", localSha])
    .split(/\r?\n/)
    .map(normalizePath)
    .filter(Boolean);
}

function readPushUpdates() {
  const input = readFileSync(0, "utf8").trim();
  if (!input) return [];

  return input
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/))
    .filter((parts) => parts.length >= 4)
    .map(([localRef, localSha, remoteRef, remoteSha]) => ({
      localRef,
      localSha,
      remoteRef,
      remoteSha,
    }));
}

function getWorkingTreeFiles() {
  const changedFiles = [
    ...runGit(["diff", "--name-only", "HEAD"]).split(/\r?\n/).map(normalizePath).filter(Boolean),
    ...runGit(["diff", "--name-only", "--cached"])
      .split(/\r?\n/)
      .map(normalizePath)
      .filter(Boolean),
    ...runGit(["ls-files", "--others", "--exclude-standard"])
      .split(/\r?\n/)
      .map(normalizePath)
      .filter(Boolean),
  ];

  return [...new Set(changedFiles)].sort();
}

function isDocsOnlyPath(filePath) {
  return (
    filePath === "README.md" ||
    filePath.startsWith("docs/") ||
    filePath.startsWith("tmp/") ||
    filePath.endsWith(".md")
  );
}

function isWebPath(filePath) {
  return filePath.startsWith("apps/web/") || filePath.startsWith("tests/web/");
}

function isAdminPath(filePath) {
  return filePath.startsWith("apps/admin/") || filePath.startsWith("tests/admin/");
}

function isSharedDataPath(filePath) {
  return filePath.startsWith("shared/data/");
}

function isSharedLibPath(filePath) {
  return filePath.startsWith("shared/lib/") || filePath.startsWith("tests/shared/");
}

function isHeavyGlobalPath(filePath) {
  return (
    filePath.startsWith("scripts/") ||
    filePath.startsWith(".github/") ||
    filePath.startsWith(".githooks/") ||
    filePath === "package.json" ||
    filePath === "package-lock.json" ||
    filePath === "eslint.config.mjs" ||
    filePath === "tailwind.config.cjs" ||
    filePath === "tsconfig.json" ||
    filePath === "tsconfig.base.json" ||
    filePath === "vitest.config.ts" ||
    filePath.startsWith("playwright.") ||
    filePath.startsWith(".prettier") ||
    filePath === ".gitattributes"
  );
}

function addChecks(target, checks) {
  for (const check of checks) {
    target.add(check);
  }
}

function selectChecks(files) {
  if (files.length === 0) return [];
  if (files.every(isDocsOnlyPath)) return ["check:quick"];

  const touchesWeb = files.some(isWebPath);
  const touchesAdmin = files.some(isAdminPath);
  const touchesSharedData = files.some(isSharedDataPath);
  const touchesSharedLib = files.some(isSharedLibPath);
  const touchesHeavyGlobal = files.some(isHeavyGlobalPath);

  if (
    touchesHeavyGlobal ||
    (touchesWeb && touchesAdmin) ||
    (!touchesWeb && !touchesAdmin && !touchesSharedData && !touchesSharedLib)
  ) {
    return ["check"];
  }

  const checks = new Set();

  if (touchesWeb) {
    addChecks(checks, [
      "check:web",
      "check:quick",
      "check:inline-usage",
      "check:web-inline-zero",
      "check:canonical-boundaries",
    ]);
  }

  if (touchesAdmin) {
    addChecks(checks, ["check:admin", "check:quick", "check:canonical-boundaries"]);
  }

  if (touchesSharedData) {
    addChecks(checks, ["check:web", "check:quick", "check:canonical-boundaries"]);
  }

  if (touchesSharedLib) {
    addChecks(checks, [
      "check:web",
      "check:admin",
      "check:quick",
      "test:unit",
      "check:canonical-boundaries",
    ]);
  }

  return [...checks];
}

const cliFiles = getCliFiles();
const updates = cliFiles.length > 0 ? [] : readPushUpdates();
const changedFiles =
  cliFiles.length > 0
    ? [...new Set(cliFiles)].sort()
    : updates.length > 0
      ? [
          ...new Set(
            updates.flatMap((update) => getChangedFiles(update.localSha, update.remoteSha)).sort(),
          ),
        ]
      : getWorkingTreeFiles();

if (changedFiles.length === 0) {
  console.log("Skipping pre-push checks for ref deletion or empty push.");
  process.exit(0);
}

const checks = selectChecks(changedFiles);

if (cliFiles.length > 0) {
  console.log("Using explicit file list for pre-push check selection.");
} else if (updates.length === 0) {
  console.log("No pre-push refs received; using working tree changes.");
}
console.log("Adaptive pre-push changed files:");
changedFiles.forEach((filePath) => console.log(`- ${filePath}`));
console.log(`Adaptive pre-push checks: ${checks.map((check) => `npm run ${check}`).join(" && ")}`);

for (const check of checks) {
  runNpmScript(check);
}
