import { type Config } from "@wagmi/core";
import { resolveAlchemyAuthConnector } from "../utils/resolveAuthConnector.js";
import { assertAuthSession } from "../utils/assertAuthSession.js";
import type { CredentialCreationOptionOverrides } from "@alchemy/auth";

export type AddPasskeyParameters =
  | CredentialCreationOptionOverrides
  | undefined;

export type AddPasskeyReturnType = void;

/**
 * Adds a passkey to the authenticated user's account.
 *
 * @param {Config} config - The shared Wagmi/Alchemy config
 * @param {AddPasskeyParameters} parameters - The parameters for the passkey creation
 * @returns {Promise<AddPasskeyReturnType>} Promise that resolves when the passkey is added
 */
export async function addPasskey(
  config: Config,
  parameters: AddPasskeyParameters,
): Promise<AddPasskeyReturnType> {
  const { connector } = resolveAlchemyAuthConnector(config);

  const authSession = connector.getAuthSession();
  assertAuthSession(authSession, "addPasskey");
  await authSession.addPasskey(parameters);
}
