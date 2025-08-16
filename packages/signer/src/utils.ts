import type { GetOauthProviderUrlArgs } from "./types.js";
import { OAuthProvidersError } from "./error.js";
import { sha256 } from "viem";

export const getOauthProviderUrl = async (
  args: GetOauthProviderUrlArgs,
): Promise<string> => {
  const { oauthParams, turnkeyPublicKey, oauthCallbackUrl, oauthConfig } = args;

  const {
    authProviderId,
    isCustomProvider,
    auth0Connection,
    scope: providedScope,
    claims: providedClaims,
    otherParameters: providedOtherParameters,
    mode,
    expirationSeconds,
  } = oauthParams;

  if (!oauthConfig) {
    throw new Error(
      "OAuth configuration must be provided before constructing the provider URL",
    );
  }

  const { codeChallenge, requestKey, authProviders } = oauthConfig;

  if (!authProviders) {
    throw new OAuthProvidersError();
  }

  const authProvider = authProviders.find(
    (provider) =>
      provider.id === authProviderId &&
      !!provider.isCustomProvider === !!isCustomProvider,
  );

  if (!authProvider) {
    throw new Error(`No auth provider found with id ${authProviderId}`);
  }

  let scope: string | undefined = providedScope;
  let claims: string | undefined = providedClaims;
  let otherParameters: Record<string, string> | undefined =
    providedOtherParameters;

  if (!isCustomProvider) {
    // Provide sensible defaults when using a known provider
    const defaultScope = "openid email";
    scope ??= defaultScope;
  }

  if (!scope) {
    throw new Error(`Default scope not known for provider ${authProviderId}`);
  }

  const { authEndpoint, clientId } = authProvider;

  const nonce = getOauthNonce(turnkeyPublicKey);
  const stateObject = {
    authProviderId,
    isCustomProvider,
    requestKey,
    turnkeyPublicKey,
    expirationSeconds,
    // popup-only for now in this package
    openerOrigin: mode === "popup" ? window.location.origin : undefined,
    fetchIdTokenOnly: oauthParams.fetchIdTokenOnly,
  };

  const state = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(stateObject)),
  );

  const authUrl = new URL(authEndpoint);
  const params: Record<string, string> = {
    redirect_uri: oauthCallbackUrl,
    response_type: "code",
    scope,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    prompt: "select_account",
    client_id: clientId,
    nonce,
    ...otherParameters,
  };

  if (claims) {
    params.claims = claims;
  }

  if (auth0Connection) {
    params.connection = auth0Connection;
  }

  Object.keys(params).forEach((param) => {
    if (params[param]) authUrl.searchParams.append(param, params[param]);
  });

  const [urlPath, searchParams] = authUrl.href.split("?");
  return `${urlPath?.replace(/\/$/, "")}?${searchParams}`;
};

const getOauthNonce = (turnkeyPublicKey: string): string => {
  return sha256(new TextEncoder().encode(turnkeyPublicKey)).slice(2);
};

export const base64UrlEncode = (
  challenge: ArrayBuffer | Uint8Array,
): string => {
  return Buffer.from(challenge as Uint8Array)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};
