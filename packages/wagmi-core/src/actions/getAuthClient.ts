import { type Config } from "@wagmi/core";
import type { AuthClient } from "@alchemy/auth";
import { resolveAlchemyAuthConnector } from "../utils/resolveAuthConnector.js";

export type GetAuthClientParameters = void;

export type GetAuthClientReturnType = AuthClient;

/**
 * Gets the AuthClient instance for the Alchemy Auth connector.
 *
 * The AuthClient provides methods for authentication operations like
 * logging in with email/OAuth, managing sessions, and user operations.
 *
 * @param {Config} config - The shared Wagmi/Alchemy config
 * @returns {AuthClient} The AuthClient instance
 *
 * @example
 * ```ts
 * const authClient = getAuthClient(config);
 * // Use authClient for authentication operations
 * await authClient.loginWithEmail({ email: "user@example.com" });
 * ```
 */
export function getAuthClient(config: Config): GetAuthClientReturnType {
  const { connector } = resolveAlchemyAuthConnector(config);
  return connector.getAuthClient();
}
