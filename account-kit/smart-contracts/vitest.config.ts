import { configDefaults, defineProject, mergeConfig } from "vitest/config";
import { sharedConfig } from "../../.vitest/vitest.shared";

export default mergeConfig(
  // @ts-ignore this does work
  sharedConfig,
  defineProject({
    test: {
      name: "account-kit/smart-contracts",
      exclude: [
        ...configDefaults.exclude,
        "**/e2e-tests/**/*.test.ts",
        "**/*.e2e.test.ts",
      ],
    },
  })
);
