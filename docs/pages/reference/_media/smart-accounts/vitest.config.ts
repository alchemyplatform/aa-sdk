import { defineProject, mergeConfig } from "vitest/config";
import { sharedConfig } from "../../.vitest/vitest.shared.js";

export default mergeConfig(
  // @ts-ignore this does work
  sharedConfig,
  defineProject({
    test: {
      name: "alchemy/smart-accounts",
    },
  }),
);
