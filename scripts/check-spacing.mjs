import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SRC_DIR = join(process.cwd(), 'src');
const TARGET_EXTENSIONS = new Set(['.css', '.vue']);
const ALLOWED_ODD_VALUES = new Set([1, 999]);

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

function validateFile(filePath) {
  const issues = [];
  const content = readFileSync(filePath, 'utf8');
  const blocks = [];
  if (filePath.endsWith('.vue')) {
    const styleTagRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/g;
    let match = styleTagRegex.exec(content);
    while (match) {
      const before = content.slice(0, match.index);
      const startLine = before.split('\n').length;
      blocks.push({ text: match[1], startLine });
      match = styleTagRegex.exec(content);
    }
  } else {
    blocks.push({ text: content, startLine: 1 });
  }

  for (const block of blocks) {
    const lines = block.text.split('\n');
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const line = lines[lineIndex];
      if (!line || line.includes('@media')) {
        continue;
      }

      const declarationMatch = line.match(/^\s*([a-zA-Z-]+)\s*:/);
      const propertyName = declarationMatch ? declarationMatch[1] : '';
      const isBorderProperty = propertyName.startsWith('border');
      const pxMatches = line.matchAll(/-?\d*\.?\d+px/g);

      for (const pxMatch of pxMatches) {
        const token = pxMatch[0];
        const numberText = token.slice(0, -2);
        if (numberText.includes('.')) {
          issues.push({
            line: block.startLine + lineIndex,
            kind: 'decimal',
            propertyName,
            token,
            sourceLine: line.trim(),
          });
          continue;
        }

        const value = Number(numberText);
        const abs = Math.abs(value);
        if (abs % 2 === 0) {
          continue;
        }

        if (ALLOWED_ODD_VALUES.has(abs)) {
          if (abs === 1 && !isBorderProperty) {
            issues.push({
              line: block.startLine + lineIndex,
              kind: 'odd',
              propertyName,
              token,
              sourceLine: line.trim(),
            });
          }
          continue;
        }

        issues.push({
          line: block.startLine + lineIndex,
          kind: 'odd',
          propertyName,
          token,
          sourceLine: line.trim(),
        });
      }
    }
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
  console.error('Spacing guard failed. Non-compliant px values detected:');
  for (const issue of allIssues) {
    console.error(
      `- ${relative(process.cwd(), issue.filePath)}:${issue.line} -> ${issue.kind} "${issue.token}" in property "${issue.propertyName || 'unknown'}" (${issue.sourceLine})`
    );
  }
  console.error(
    'Rules: no decimal px; no odd px except 1px on border* properties and 999px for pill radius.'
  );
  process.exit(1);
}

console.log(
  `Spacing guard OK: ${allFiles.length} file(s) checked, px values follow project rules.`
);
