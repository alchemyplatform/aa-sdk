import { defineConfig } from "vitest/config";

// Minimal vitest config for only running e2e tests, skipping the global setup defined in the main `vitest.config.ts`.
export default defineConfig({
  test: { include: ["**/*.e2e.test.ts"], globals: true },
});
