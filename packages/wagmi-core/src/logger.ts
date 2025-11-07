import { createLogger } from "@alchemy/common";
import type { DiagnosticsLogger } from "@alchemy/common";
import { VERSION } from "./version.js";

export const LOGGER: DiagnosticsLogger = createLogger({
  package: "@alchemy/wagmi-core",
  version: VERSION,
  namespace: "wagmi-core",
});
