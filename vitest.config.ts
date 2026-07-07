import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Node by default (fast); files needing a DOM opt in per-file with
    // `// @vitest-environment jsdom`.
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
