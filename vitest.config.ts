import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    maxWorkers: 4,
    projects: [".vitest", "packages/*", "api-codegen"],
  },
});
