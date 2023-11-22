import { configDefaults, defineProject } from "vitest/config";

export default defineProject({
  test: {
    singleThread: true,
    globals: true,
    setupFiles: ["../../.vitest/setupTests.ts"],
    exclude: [...configDefaults.exclude, "**/e2e-tests/**/*.test.ts"],
    name: "signers",
    environment: "jsdom",
  },
});
