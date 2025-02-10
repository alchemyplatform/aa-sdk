import { join } from "node:path";
import { configDefaults, defineConfig } from "vitest/config";
const typechecking = process.env["TYPECHECK"] === "true";
export const sharedConfig = defineConfig({
  test: {
    typecheck: {
      enabled: typechecking,
      only: typechecking,
      ignoreSourceErrors: true,
    },
    alias: {
      "~test": join(__dirname, "./src"),
    },
    testTimeout: 60_000,
    hookTimeout: 60_000,
    teardownTimeout: 60_000,
    globals: true,
    setupFiles: [join(__dirname, "setupTests.ts")],
    globalSetup: join(__dirname, "globalSetup.ts"),
    pool: "threads",
    poolOptions: {
      threads: {
        minThreads: 4,
        maxThreads: 4,
      },
    },
    exclude: [
      ...configDefaults.exclude,
      "**/e2e-tests/**/*.test.ts",
      "**/*.test.e2e.ts",
    ],
  },
});
