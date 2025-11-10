import { createLogger } from "@alchemy/common";
import type { DiagnosticsLogger } from "@alchemy/common";
import { VERSION } from "./version.js";

export const LOGGER: DiagnosticsLogger = createLogger({
  package: "@alchemy/smart-accounts",
  version: VERSION,
  namespace: "smart-accounts",
});
