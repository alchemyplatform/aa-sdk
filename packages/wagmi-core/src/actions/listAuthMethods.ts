import { type Config } from "@wagmi/core";
import { type Prettify } from "viem";
import type { AuthMethods } from "@alchemy/auth";
import { resolveAlchemyAuthConnector } from "../utils/resolveAuthConnector.js";
import { assertAuthSession } from "../utils/assertAuthSession.js";

export type ListAuthMethodsReturnType = Prettify<AuthMethods>;

/**
 * List all authentication methods associated with the current auth session.
 *
 * This function retrieves the available authentication methods for the authenticated user,
 * which may include email, social logins, passkeys, and other supported auth methods.
 *
 * @param {Config} config - The Wagmi config
 * @returns {Promise<ListAuthMethodsReturnType>} Promise that resolves with the list of authentication methods
 * @throws {Error} Throws if there is no active auth session
 */
export async function listAuthMethods(
  config: Config,
): Promise<ListAuthMethodsReturnType> {
  const { connector } = resolveAlchemyAuthConnector(config);

  const authSession = connector.getAuthSession();
  assertAuthSession(authSession, "listAuthMethods");

  return await authSession.listAuthMethods();
}
