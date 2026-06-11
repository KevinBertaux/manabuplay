import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PACK_INDEX_REL = path.join("shared", "data", "manabuplay", "packs", "index.json");

function hasPackIndex(dir: string) {
  return fs.existsSync(path.join(dir, PACK_INDEX_REL));
}

/** Trouve la racine monorepo, quel que soit le cwd ou le chunk Astro/Vite. */
export function findRepoRoot() {
  const seeds = new Set<string>([process.cwd(), path.dirname(fileURLToPath(import.meta.url))]);

  for (const seed of seeds) {
    let dir = path.resolve(seed);

    for (let depth = 0; depth < 8; depth += 1) {
      if (hasPackIndex(dir)) return dir;

      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }

  throw new Error(`Could not locate repo root (${PACK_INDEX_REL}).`);
}

export function getManabuplayDataDir() {
  return path.join(findRepoRoot(), "shared", "data", "manabuplay");
}
