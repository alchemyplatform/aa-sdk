import { configDefaults, defineProject } from "vitest/config";

export default defineProject({
  test: {
    globals: true,
    setupFiles: ["../../.vitest/setupTests.ts"],
    include: [...configDefaults.include, "**/e2e-tests/**/*.test.ts"],
    exclude: [...configDefaults.exclude, "**/__tests__/**/*.test.ts"],
    name: "accounts",
  },
});
