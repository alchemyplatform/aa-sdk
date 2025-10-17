import { type Config } from "@wagmi/core";
import type { AuthClient } from "@alchemy/auth";
import { resolveAlchemyAuthConnector } from "../utils/resolveAuthConnector.js";

export type GetAuthClientParameters = void;

export type GetAuthClientReturnType = AuthClient;

/**
 * Gets the AuthClient instance for the Alchemy Auth connector.
 *
 * **Advanced usage only.** For most use cases, use higher-level actions instead.
 *
 * @param {Config} config - The shared Wagmi/Alchemy config
 * @returns {AuthClient} The AuthClient instance
 */
export function getAuthClient(config: Config): GetAuthClientReturnType {
  const { connector } = resolveAlchemyAuthConnector(config);
  return connector.getAuthClient();
}
