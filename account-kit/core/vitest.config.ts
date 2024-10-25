import { join } from "node:path";
import { defineProject, mergeConfig } from "vitest/config";
import { sharedConfig } from "../../.vitest/vitest.shared";

export default mergeConfig(
  // @ts-ignore this does work
  sharedConfig,
  defineProject({
    test: {
      name: "account-kit/core",
      environment: "jsdom",
      setupFiles: [
        ...(sharedConfig.test?.setupFiles ?? []),
        join(__dirname, "setupTests.ts"),
      ],
    },
  })
);
