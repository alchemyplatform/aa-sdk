import { type Config } from "@wagmi/core";
import { resolveAlchemyAuthConnector } from "../utils/resolveAuthConnector.js";
import type { LoginWithPasskeyParams } from "@alchemy/auth";

export type LoginWithPasskeyParameters = LoginWithPasskeyParams;
export type LoginWithPasskeyReturnType = void;

/**
 * Initiates Passkey authentication flow with the specified parameters.
 *
 * @param {Config} config - The shared Wagmi/Alchemy config
 * @param {LoginWithPasskeyParameters} parameters - Passkey authentication parameters
 * @returns {Promise<LoginWithPasskeyReturnType>} Promise that resolves when authentication completes and connection is established
 */
export async function loginWithPasskey(
  config: Config,
  parameters: LoginWithPasskeyParameters,
): Promise<LoginWithPasskeyReturnType> {
  const { connector, connectAlchemyAuth } = resolveAlchemyAuthConnector(config);
  const authClient = connector.getAuthClient();

  const authSession = await authClient.loginWithPasskey(parameters);

  connector.setAuthSession(authSession);
  await connectAlchemyAuth();
}
