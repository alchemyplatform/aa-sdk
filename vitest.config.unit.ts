import { configDefaults, defineConfig } from "vitest/dist/config";

export default defineConfig({
  test: {
    singleThread: true,
    globals: true,
    setupFiles: [".vitest/setupTests.ts"],
    exclude: [...configDefaults.exclude, "**/e2e-tests/**/*.test.ts"],
    name: "aa-sdk-unit-tests",
  },
});
