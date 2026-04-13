import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/lib/serialize-inline-script.ts",
        "src/lib/admin-nav.ts",
        "src/lib/admin-roadmap.ts",
        "src/lib/manabuplay-roadmap.ts",
        "src/lib/manabuplay-pack-reader.ts",
        "src/lib/admin-documents.ts",
        "src/data/manabuplay/catalog.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80,
      },
    },
  },
});
