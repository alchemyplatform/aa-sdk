import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    environment: "jsdom",
    name: "account-kit/logging",
    globals: true,
  },
});

// export default mergeConfig(
//   // @ts-ignore this does work
//   sharedConfig,
//   defineProject({
//     test: {
//       environment: "jsdom",
//       name: "account-kit/logging",
//       setupFiles: [],
//       globalSetup: [],
//     },
//   })
// );
