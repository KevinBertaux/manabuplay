import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SRC_DIR = join(process.cwd(), 'src');
const ALLOWED_WIDTHS = new Set([639, 640, 767, 768, 1023, 1024, 1279, 1280, 1535, 1536]);
const TARGET_EXTENSIONS = new Set(['.css', '.vue']);

function listFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const st = statSync(fullPath);
    if (st.isDirectory()) {
      results.push(...listFiles(fullPath));
      continue;
    }

    const ext = fullPath.slice(fullPath.lastIndexOf('.'));
    if (TARGET_EXTENSIONS.has(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

function lineNumberFromIndex(content, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (content.charCodeAt(i) === 10) {
      line += 1;
    }
  }
  return line;
}

function validateFile(filePath) {
  const issues = [];
  const content = readFileSync(filePath, 'utf8');
  const mediaQueryRegex = /@media\s*([^{]+)\{/g;

  let mediaMatch = mediaQueryRegex.exec(content);
  while (mediaMatch) {
    const query = mediaMatch[1];
    const widthRegex = /\((max|min)-width:\s*(\d+)px\)/g;

    let widthMatch = widthRegex.exec(query);
    while (widthMatch) {
      const widthPx = Number(widthMatch[2]);
      if (!ALLOWED_WIDTHS.has(widthPx)) {
        issues.push({
          line: lineNumberFromIndex(content, mediaMatch.index),
          kind: widthMatch[1],
          value: widthPx,
          query: query.trim().replace(/\s+/g, ' '),
        });
      }
      widthMatch = widthRegex.exec(query);
    }

    mediaMatch = mediaQueryRegex.exec(content);
  }

  return issues;
}

const allFiles = listFiles(SRC_DIR);
const allIssues = [];

for (const filePath of allFiles) {
  const issues = validateFile(filePath);
  for (const issue of issues) {
    allIssues.push({ filePath, ...issue });
  }
}

if (allIssues.length > 0) {
  console.error('Breakpoint guard failed. Non-standard values detected:');
  for (const issue of allIssues) {
    console.error(
      `- ${relative(process.cwd(), issue.filePath)}:${issue.line} -> ${issue.kind}-width ${issue.value}px in "${issue.query}"`
    );
  }
  console.error(
    `Allowed widths (px): ${Array.from(ALLOWED_WIDTHS)
      .sort((a, b) => a - b)
      .join(', ')}`
  );
  process.exit(1);
}

console.log(
  `Breakpoint guard OK: ${allFiles.length} file(s) checked, all @media widths match the allowed set.`
);
