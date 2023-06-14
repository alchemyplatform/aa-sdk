import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    globals: true,
    setupFiles: ["../../.vitest/setupTests.ts"],
    name: "aa-alchemy",
  },
});
