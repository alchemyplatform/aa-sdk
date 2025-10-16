import { type Config } from "@wagmi/core";
import type { User } from "@alchemy/auth";
import { resolveAlchemyAuthConnector } from "../utils/resolveAuthConnector.js";

export type GetUserParameters = void;

export type GetUserReturnType = User;

/**
 * Gets the current authenticated user's information.
 *
 * Returns user details including email, phone, address, and organization ID.
 *
 * @param {Config} config - The shared Wagmi/Alchemy config
 * @returns {User} The current user object
 * @throws {Error} If no active auth session exists
 *
 * @example
 * ```ts
 * const user = getUser(config);
 * console.log("User address:", user.address);
 * console.log("User email:", user.email);
 * console.log("User phone:", user.phone);
 * ```
 */
export function getUser(config: Config): GetUserReturnType {
  const { connector } = resolveAlchemyAuthConnector(config);
  const authSession = connector.getAuthSession();

  if (!authSession) {
    throw new Error("No active auth session. Please authenticate first.");
  }

  return authSession.getUser();
}
