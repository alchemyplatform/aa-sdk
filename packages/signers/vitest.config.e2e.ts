import { configDefaults, defineProject } from "vitest/config";

export default defineProject({
  test: {
    singleThread: true,
    globals: true,
    setupFiles: ["../../.vitest/setupTests.ts"],
    exclude: [...configDefaults.exclude, "**/__tests__/**/*.test.ts"],
    name: "signers",
    environment: "jsdom",
  },
});
