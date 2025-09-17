import { connect, type Config } from "@wagmi/core";
import {
  resolveAlchemyAuthConnector,
  type AlchemyAuthConnector,
} from "@alchemy/connectors-web";

export type HandleOauthRedirectParameters = void;

export type HandleOauthRedirectReturnType = void;

/**
 * Handles OAuth redirect callback after user returns from OAuth provider.
 * This should be called on the redirect page and will automatically extract
 * OAuth parameters from the current URL.
 *
 * @param {Config} config - The shared Wagmi/Alchemy config
 * @returns {Promise<HandleOauthRedirectReturnType>} Promise that resolves when authentication completes and connection is established
 */
export async function handleOauthRedirect(
  config: Config,
): Promise<HandleOauthRedirectReturnType> {
  const connector: AlchemyAuthConnector = resolveAlchemyAuthConnector(config);
  const authClient = connector.getAuthClient();

  const authSession = await authClient.handleOauthRedirect();

  if (!authSession) {
    throw new Error("OAuth authentication failed - no auth session returned");
  }

  connector.setAuthSession(authSession);
  await connect(config, { connector });
}
