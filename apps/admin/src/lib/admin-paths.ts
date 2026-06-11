import path from "node:path";
import { fileURLToPath } from "node:url";

const adminSrcDir = path.dirname(fileURLToPath(import.meta.url));

/** Racine `apps/admin` (depuis `src/lib`). */
export const ADMIN_APP_ROOT = path.resolve(adminSrcDir, "../..");

/** Racine du monorepo (depuis `apps/admin`). */
export const REPO_ROOT = path.resolve(ADMIN_APP_ROOT, "../..");

export const ADMIN_PUBLIC_DIR = path.join(ADMIN_APP_ROOT, "public");

/** Captures Insight générées localement (`npm run insight:capture`). */
export const INSIGHT_CAPTURES_DIR = path.join(
  ADMIN_APP_ROOT,
  "..",
  "..",
  "tmp",
  "captures",
  "insight",
);
