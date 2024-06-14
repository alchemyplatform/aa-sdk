import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    singleThread: true,
    globals: true,
    setupFiles: ["../../.vitest/setupTests.ts"],
    include: ["**/*/*.e2e.test.ts"],
    name: "account-kit/react",
  },
});
