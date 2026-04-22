import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/admin/unit/**/*.test.ts", "tests/shared/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "shared/lib/**/*.ts",
        "shared/data/**/*.ts",
        "apps/admin/src/lib/admin-nav.ts",
        "apps/admin/src/lib/admin-roadmap.ts",
        "apps/admin/src/lib/manabuplay-roadmap.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80,
      },
    },
  },
});
