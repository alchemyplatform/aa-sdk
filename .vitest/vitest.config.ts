import { defineProject, mergeConfig } from "vitest/config";
import { sharedConfig } from "./vitest.shared";

delete sharedConfig.test?.setupFiles;

export default mergeConfig(
  // @ts-ignore this does work
  sharedConfig,
  defineProject({
    test: {
      name: "account-kit/testing",
    },
  }),
);
