import { defineProject, mergeConfig } from "vitest/config";
import { sharedConfig } from "../../.vitest/vitest.shared";

export default mergeConfig(
  // @ts-ignore this does work
  sharedConfig,
  defineProject({
    test: {
      name: "alchemy/wallet-apis",
      maxWorkers: 1,
      isolate: false,
      retry: 2,
      sequence: {
        groupOrder: 1,
      },
    },
  }),
);
