import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const ROOT = process.cwd();
const TARGET_DIRS = [
  "src",
  "docs",
  "public",
  "apps/web/src",
  "apps/web/public",
  "apps/admin/src",
  "apps/admin/public",
  "shared",
];
const TARGET_EXTENSIONS = new Set([".astro", ".css", ".html"]);
const IGNORED_DIRS = new Set([
  ".astro",
  ".codex-temp",
  "dist",
  "legacy",
  "node_modules",
  "playwright-report",
  "test-results",
]);

const ALLOWED_RADIUS_VALUES = new Set([0, 4, 8, 12, 16, 999]);
const VISUAL_EFFECT_PROPERTIES = new Set([
  "background-position",
  "background-position-x",
  "background-position-y",
  "background-size",
  "backdrop-filter",
  "box-shadow",
  "drop-shadow",
  "filter",
  "stroke-width",
  "text-shadow",
  "transform",
]);
const TYPOGRAPHY_EXEMPT_PROPERTIES = new Set(["letter-spacing", "line-height", "word-spacing"]);
const SPACING_PROPERTIES = new Set([
  "bottom",
  "column-gap",
  "gap",
  "inset",
  "inset-block",
  "inset-block-end",
  "inset-block-start",
  "inset-inline",
  "inset-inline-end",
  "inset-inline-start",
  "left",
  "margin",
  "margin-block",
  "margin-block-end",
  "margin-block-start",
  "margin-bottom",
  "margin-inline",
  "margin-inline-end",
  "margin-inline-start",
  "margin-left",
  "margin-right",
  "margin-top",
  "padding",
  "padding-block",
  "padding-block-end",
  "padding-block-start",
  "padding-bottom",
  "padding-inline",
  "padding-inline-end",
  "padding-inline-start",
  "padding-left",
  "padding-right",
  "padding-top",
  "right",
  "row-gap",
  "top",
]);
const SIZE_PROPERTIES = new Set([
  "block-size",
  "height",
  "inline-size",
  "max-block-size",
  "max-height",
  "max-inline-size",
  "max-width",
  "min-block-size",
  "min-height",
  "min-inline-size",
  "min-width",
  "width",
]);

const CSS_DECLARATION_REGEX = /([a-zA-Z-]+)\s*:\s*([^;}{]+)(?=;|\})/g;
const PX_TOKEN_REGEX = /-?\d*\.?\d+px/g;
const STYLE_TAG_REGEX = /<style\b[^>]*>([\s\S]*?)<\/style>/g;
const STYLE_ATTR_REGEX = /\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
const DIMENSION_ATTR_REGEX =
  /(^|[\s<])(width|height)\s*=\s*(?:"([0-9]+(?:\.[0-9]+)?)"|'([0-9]+(?:\.[0-9]+)?)')/gm;

function listFiles(dir) {
  if (!statSafe(dir)?.isDirectory()) {
    return [];
  }

  const results = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const st = statSafe(fullPath);
    if (!st) {
      continue;
    }

    if (st.isDirectory()) {
      if (!IGNORED_DIRS.has(entry)) {
        results.push(...listFiles(fullPath));
      }
      continue;
    }

    if (TARGET_EXTENSIONS.has(extname(fullPath))) {
      results.push(fullPath);
    }
  }

  return results;
}

function statSafe(targetPath) {
  try {
    return statSync(targetPath);
  } catch {
    return null;
  }
}

function countNewlines(text) {
  const matches = text.match(/\n/g);
  return matches ? matches.length : 0;
}

function getPropertyGroup(propertyName) {
  if (!propertyName) {
    return "exempt";
  }

  if (VISUAL_EFFECT_PROPERTIES.has(propertyName)) {
    return "effect";
  }

  if (TYPOGRAPHY_EXEMPT_PROPERTIES.has(propertyName)) {
    return "typography";
  }

  if (propertyName === "font-size") {
    return "font-size";
  }

  if (propertyName.includes("radius")) {
    return "radius";
  }

  if (
    propertyName.startsWith("border") &&
    !propertyName.includes("radius") &&
    !propertyName.includes("image")
  ) {
    return "border";
  }

  if (propertyName === "outline-width") {
    return "border";
  }

  if (SPACING_PROPERTIES.has(propertyName)) {
    return "spacing";
  }

  if (SIZE_PROPERTIES.has(propertyName)) {
    return "size";
  }

  return "exempt";
}

function recordIssue(issues, filePath, line, kind, propertyName, token, sourceLine) {
  issues.push({
    filePath,
    line,
    kind,
    propertyName,
    token,
    sourceLine: sourceLine.trim(),
  });
}

function validateDeclarationValue(issues, filePath, line, propertyName, valueText, sourceLine) {
  const pxMatches = valueText.match(PX_TOKEN_REGEX);
  if (!pxMatches) {
    return;
  }

  const group = getPropertyGroup(propertyName);
  if (group === "effect" || group === "typography" || group === "exempt") {
    return;
  }

  for (const token of pxMatches) {
    const numberText = token.slice(0, -2);

    if (numberText.includes(".")) {
      recordIssue(issues, filePath, line, `decimal-${group}`, propertyName, token, sourceLine);
      continue;
    }

    const value = Number(numberText);
    const abs = Math.abs(value);

    if (group === "radius") {
      if (abs % 2 !== 0 && abs !== 999) {
        recordIssue(issues, filePath, line, "odd-radius", propertyName, token, sourceLine);
        continue;
      }

      if (!ALLOWED_RADIUS_VALUES.has(abs)) {
        recordIssue(issues, filePath, line, "radius-scale", propertyName, token, sourceLine);
      }
      continue;
    }

    if (group === "border") {
      continue;
    }

    if (abs % 2 !== 0) {
      recordIssue(issues, filePath, line, `odd-${group}`, propertyName, token, sourceLine);
    }
  }
}

function validateStyleText(issues, filePath, text, startLine) {
  const sanitized = text.replace(/\/\*[\s\S]*?\*\//g, (comment) => " ".repeat(comment.length));
  let match = CSS_DECLARATION_REGEX.exec(sanitized);

  while (match) {
    const line = startLine + countNewlines(sanitized.slice(0, match.index));
    const propertyName = match[1];
    const valueText = match[2];
    validateDeclarationValue(issues, filePath, line, propertyName, valueText, match[0]);
    match = CSS_DECLARATION_REGEX.exec(sanitized);
  }
}

function validateDimensionAttributes(issues, filePath, content) {
  let match = DIMENSION_ATTR_REGEX.exec(content);

  while (match) {
    const line = 1 + countNewlines(content.slice(0, match.index));
    const propertyName = match[2];
    const numberText = match[3] ?? match[4] ?? "";
    const token = `${numberText}px`;

    if (numberText.includes(".")) {
      recordIssue(issues, filePath, line, "decimal-attr", propertyName, token, match[0]);
      match = DIMENSION_ATTR_REGEX.exec(content);
      continue;
    }

    const value = Number(numberText);
    if (Math.abs(value) % 2 !== 0) {
      recordIssue(issues, filePath, line, "odd-attr", propertyName, token, match[0]);
    }

    match = DIMENSION_ATTR_REGEX.exec(content);
  }
}

function validateFile(filePath) {
  const issues = [];
  const content = readFileSync(filePath, "utf8");
  const ext = extname(filePath);

  if (ext === ".css") {
    validateStyleText(issues, filePath, content, 1);
    return issues;
  }

  let styleTagMatch = STYLE_TAG_REGEX.exec(content);
  while (styleTagMatch) {
    const startLine = 1 + countNewlines(content.slice(0, styleTagMatch.index));
    validateStyleText(issues, filePath, styleTagMatch[1], startLine);
    styleTagMatch = STYLE_TAG_REGEX.exec(content);
  }

  let styleAttrMatch = STYLE_ATTR_REGEX.exec(content);
  while (styleAttrMatch) {
    const value = styleAttrMatch[1] ?? styleAttrMatch[2] ?? "";
    const startLine = 1 + countNewlines(content.slice(0, styleAttrMatch.index));
    validateStyleText(issues, filePath, value, startLine);
    styleAttrMatch = STYLE_ATTR_REGEX.exec(content);
  }

  validateDimensionAttributes(issues, filePath, content);
  return issues;
}

const files = TARGET_DIRS.flatMap((dir) => listFiles(join(ROOT, dir)));
const issues = [];

for (const filePath of files) {
  issues.push(...validateFile(filePath));
}

if (issues.length > 0) {
  console.error("Design px guard failed. Non-compliant values detected:");
  for (const issue of issues) {
    console.error(
      `- ${relative(ROOT, issue.filePath)}:${issue.line} -> ${issue.kind} "${issue.token}" in "${issue.propertyName}" (${issue.sourceLine})`,
    );
  }
  console.error(
    "Rules: spacing/top-right-bottom-left/inset px must be even integers; width/height/min/max px must be even integers; font-size in px must be even integers; border-radius must be 0/4/8/12/16/999; border widths may be odd; line-height, letter-spacing and visual effects are exempt.",
  );
  process.exit(1);
}

console.log(
  `Design px guard OK: ${files.length} file(s) checked, all values follow project rules.`,
);
