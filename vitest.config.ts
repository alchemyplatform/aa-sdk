import { configDefaults, defineProject } from "vitest/dist/config";

export default defineProject({
  test: {
    singleThread: true,
    globals: true,
    setupFiles: [".vitest/setupTests.ts"],
    exclude: [...configDefaults.exclude, "**/e2e-tests/**/*.test.ts"],
    name: "aa-sdk-unit-tests",
  },
});
