import { type Config } from "@wagmi/core";
import type { AuthSession } from "@alchemy/auth";
import { resolveAlchemyAuthConnector } from "../utils/resolveAuthConnector.js";

export type GetAuthSessionParameters = void;

export type GetAuthSessionReturnType = AuthSession | null;

/**
 * Gets the current authentication session.
 *
 * Returns the AuthSession instance if a user is authenticated, or null if not authenticated.
 * The AuthSession provides access to signing methods, user info, and session management.
 *
 * @param {Config} config - The shared Wagmi/Alchemy config
 * @returns {AuthSession | null} The current auth session, or null if not authenticated
 *
 * @example
 * ```ts
 * const authSession = getAuthSession(config);
 * if (authSession) {
 *   const user = authSession.getUser();
 *   console.log("Authenticated as:", user.address);
 * } else {
 *   console.log("Not authenticated");
 * }
 * ```
 */
export function getAuthSession(config: Config): GetAuthSessionReturnType {
  const { connector } = resolveAlchemyAuthConnector(config);
  return connector.getAuthSession();
}
