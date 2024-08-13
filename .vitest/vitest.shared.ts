import { join } from "node:path";
import { configDefaults, defineConfig } from "vitest/config";

export const sharedConfig = defineConfig({
  test: {
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
    exclude: [
      ...configDefaults.exclude,
      "**/e2e-tests/**/*.test.ts",
      "**/*.test.e2e.ts",
    ],
  },
});
