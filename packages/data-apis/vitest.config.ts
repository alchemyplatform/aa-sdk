import { defineProject } from "vitest/config";

const typechecking = process.env["TYPECHECK"] === "true";

export default defineProject({
  test: {
    name: "alchemy/data-apis",
    globals: true,
    include: ["src/**/*.test.ts"],
    typecheck: {
      enabled: typechecking,
      only: typechecking,
      ignoreSourceErrors: true,
    },
    // Unit tests stub fetch; no anvil/bundler setup needed (same as common)
    setupFiles: [],
    globalSetup: undefined,
    testTimeout: 10_000,
    hookTimeout: 10_000,
  },
});
