import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "alchemy/common",
    globals: true,
    include: ["tests/**/*.test.ts"],
    // Skip blockchain setup for unit tests - most common tests don't need anvil
    setupFiles: [],
    globalSetup: undefined,
    testTimeout: 10_000,
    hookTimeout: 10_000,
  },
});
