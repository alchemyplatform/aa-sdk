import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "alchemy/connectors-web",
    globals: true,
    include: ["tests/**/*.test.ts"],
    // Skip blockchain setup for unit tests - connector tests don't need anvil
    setupFiles: [],
    globalSetup: undefined,
    testTimeout: 10_000,
    hookTimeout: 10_000,
  },
});
