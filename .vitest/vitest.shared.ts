import { join } from "node:path";
import { configDefaults, defineConfig } from "vitest/config";

export const sharedConfig = defineConfig({
  test: {
    alias: {
      "~test": join(__dirname, "."),
    },
    singleThread: true,
    globals: true,
    setupFiles: [join(__dirname, "setupTests.ts")],
    exclude: [
      ...configDefaults.exclude,
      "**/e2e-tests/**/*.test.ts",
      "**/*.test.e2e.ts",
    ],
  },
});
