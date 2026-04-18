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
        "apps/admin/src/lib/**/*.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80,
      },
    },
  },
});
