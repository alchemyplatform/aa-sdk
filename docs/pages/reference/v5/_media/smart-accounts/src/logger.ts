import { createLogger } from "@alchemy/common/internal";
import type { DiagnosticsLogger } from "@alchemy/common/internal";
import { VERSION } from "./version.js";

export const LOGGER: DiagnosticsLogger = createLogger({
  package: "@alchemy/smart-accounts",
  version: VERSION,
  namespace: "smart-accounts",
});
