import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "alchemy/api-codegen",
    globals: true,
    include: ["tests/**/*.test.ts"],
    setupFiles: [],
    globalSetup: undefined,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
