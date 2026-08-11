import { defineProject } from "vitest/config";

// Stub unit tests only (e2e lives in *.e2e.test.ts and runs via bun).
// Intentionally skip sharedConfig so we do not pull in anvil/rundler setup.
export default defineProject({
  test: {
    name: "account-kit/wallet-client",
    globals: true,
    exclude: [
      "**/e2e-tests/**/*.test.ts",
      "**/*.test.e2e.ts",
      "**/*.e2e.test.ts",
    ],
  },
});
