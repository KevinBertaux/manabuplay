import fs from 'node:fs/promises';
import path from 'node:path';
import { buildSymmetryShapeReviewReport } from '../src/features/math/symmetryShapeReview.js';

const ROOT = process.cwd();
const FILES = [
  'src/content/math/symmetry/shapes-3-points.json',
  'src/content/math/symmetry/shapes-4-points.json',
  'src/content/math/symmetry/shapes-5-points.json',
];

async function readShapeFile(file) {
  const absolute = path.join(ROOT, file);
  const raw = await fs.readFile(absolute, 'utf8');
  const json = JSON.parse(raw);
  return {
    file,
    shapes: Array.isArray(json.shapes) ? json.shapes : [],
  };
}

async function main() {
  const files = await Promise.all(FILES.map(readShapeFile));
  const report = buildSymmetryShapeReviewReport(files);

  const outputDir = path.join(ROOT, 'tmp');
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, 'symmetry-shape-report.json'), JSON.stringify(report, null, 2));

  console.log(JSON.stringify(report.summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
