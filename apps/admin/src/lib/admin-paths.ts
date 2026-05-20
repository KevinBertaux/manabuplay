import path from "node:path";
import { fileURLToPath } from "node:url";

const adminSrcDir = path.dirname(fileURLToPath(import.meta.url));

/** Racine `apps/admin` (depuis `src/lib`). */
export const ADMIN_APP_ROOT = path.resolve(adminSrcDir, "../..");

export const ADMIN_PUBLIC_DIR = path.join(ADMIN_APP_ROOT, "public");

export const INSIGHT_CAPTURES_DIR = path.join(ADMIN_PUBLIC_DIR, "insight-captures");
