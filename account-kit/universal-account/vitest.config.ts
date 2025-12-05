import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "account-kit/universal-account",
    globals: true,
    environment: "node",
  },
});
