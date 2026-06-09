import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "alchemy/data-apis",
    globals: true,
    include: ["src/**/*.test.ts"],
    // Unit tests stub fetch; no anvil/bundler setup needed (same as common)
    setupFiles: [],
    globalSetup: undefined,
    testTimeout: 10_000,
    hookTimeout: 10_000,
  },
});
