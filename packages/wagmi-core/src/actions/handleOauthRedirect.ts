import { type Config } from "@wagmi/core";
import { resolveAlchemyAuthConnector } from "../utils/resolveAuthConnector.js";
import { assertAuthSession } from "../utils/assertAuthSession.js";

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
  const { connector, connectAlchemyAuth } = resolveAlchemyAuthConnector(config);
  const authClient = connector.getAuthClient();

  const authSession = await authClient.handleOauthRedirect();
  assertAuthSession(authSession, "handleOauthRedirect"); // TODO(jh): double check this works now that it's sync!!!!

  connector.setAuthSession(authSession);
  await connectAlchemyAuth();
}
