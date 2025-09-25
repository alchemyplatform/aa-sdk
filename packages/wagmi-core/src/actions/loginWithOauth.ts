import { type Config } from "@wagmi/core";
import { resolveAlchemyAuthConnector } from "../utils/resolveAuthConnector.js";

export type LoginWithOauthParameters = {
  /** OAuth provider type (e.g., "google", "facebook", "apple") */
  provider: string;
  /** Optional redirect URL after OAuth completion */
  redirectUrl?: string;
  /** Whether to use popup (default) or redirect flow */
  mode?: "popup" | "redirect";
};

export type LoginWithOauthReturnType = void;

/**
 * Initiates OAuth authentication flow with the specified provider.
 *
 * @param {Config} config - The shared Wagmi/Alchemy config
 * @param {LoginWithOauthParameters} parameters - OAuth authentication parameters
 * @param {string} parameters.provider - The OAuth provider to use
 * @param {string} [parameters.redirectUrl] - Optional redirect URL after OAuth completion
 * @param {"popup" | "redirect"} [parameters.mode] - Authentication flow mode (defaults to "popup")
 * @returns {Promise<LoginWithOauthReturnType>} Promise that resolves when authentication completes and connection is established
 */
export async function loginWithOauth(
  config: Config,
  parameters: LoginWithOauthParameters,
): Promise<LoginWithOauthReturnType> {
  const { connector, connectAlchemyAuth } = resolveAlchemyAuthConnector(config);
  const authClient = connector.getAuthClient();

  const authSession = await authClient.loginWithOauth({
    type: "oauth",
    authProviderId: parameters.provider,
    mode: parameters.mode ?? "popup",
  });

  connector.setAuthSession(authSession);
  await connectAlchemyAuth();
}
