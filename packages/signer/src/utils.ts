import { sha256 } from "viem";

export type KnownAuthProvider =
  | "google" 
  | "apple"
  | "facebook"
  | "twitch"
  | "auth0";

export type OauthMode = "redirect" | "popup";

export type OauthParams = {
  authProviderId: string;
  isCustomProvider?: boolean;
  auth0Connection?: string;
  scope?: string;
  claims?: string;
  otherParameters?: Record<string, string>;
  mode: OauthMode;
  redirectUrl: string;
  expirationSeconds?: number;
  fetchIdTokenOnly?: boolean;
};

export type OauthConfig = {
  codeChallenge: string;
  requestKey: string;
  authProviders: AuthProviderConfig[];
};

export type AuthProviderConfig = {
  id: string;
  isCustomProvider?: boolean;
  clientId: string;
  authEndpoint: string;
};

export type OauthState = {
  authProviderId: string;
  isCustomProvider?: boolean;
  requestKey: string;
  turnkeyPublicKey: string;
  expirationSeconds?: number;
  redirectUrl?: string;
  openerOrigin?: string;
  fetchIdTokenOnly?: boolean;
};

export type GetOauthProviderUrlArgs = {
  oauthParams: OauthParams;
  turnkeyPublicKey: string;
  oauthCallbackUrl: string;
  oauthConfig: OauthConfig;
  usesRelativeUrl?: boolean;
};

export type AuthProviderCustomization = {
  scope: string;
  claims?: string;
  otherParameters?: Record<string, string>;
};

const DEFAULT_PROVIDER_CUSTOMIZATION: Record<
  KnownAuthProvider,
  AuthProviderCustomization
> = {
  google: { scope: "openid email" },
  apple: { scope: "openid email" },
  facebook: {
    scope: "openid email",
    // Fixes Facebook mobile login so that `window.opener` doesn't get nullified.
    otherParameters: { sdk: "joey" },
  },
  twitch: {
    scope: "openid user:read:email",
    claims: JSON.stringify({ id_token: { email: null } }),
    // Forces Twitch to show the login page even if the user is already logged in.
    otherParameters: { force_verify: "true" },
  },
  auth0: { scope: "openid email" },
};

/**
 * Returns the default customization parameters when using a known auth provider
 *
 * @param {string} knownAuthProviderId id of a known auth provider, e.g. "google"
 * @returns {AuthProviderCustomization | undefined} default customization parameters
 */
export function getDefaultProviderCustomization(
  knownAuthProviderId: KnownAuthProvider,
): AuthProviderCustomization | undefined {
  return DEFAULT_PROVIDER_CUSTOMIZATION[knownAuthProviderId];
}

/**
 * Generates an OAuth nonce based on a Turnkey public key
 *
 * @param {string} turnkeyPublicKey key from a Turnkey iframe
 * @returns {string} nonce to be used in OIDC
 */
export function getOauthNonce(turnkeyPublicKey: string): string {
  return sha256(new TextEncoder().encode(turnkeyPublicKey)).slice(2);
}

/**
 * Base64 URL encode function
 *
 * @param {ArrayBuffer | Uint8Array | string} challenge - The data to encode
 * @returns {string} Base64 URL encoded string
 */
export function base64UrlEncode(challenge: ArrayBuffer | Uint8Array | string): string {
  let bytes: Uint8Array;
  
  if (typeof challenge === "string") {
    bytes = new TextEncoder().encode(challenge);
  } else if (challenge instanceof ArrayBuffer) {
    bytes = new Uint8Array(challenge);
  } else {
    bytes = challenge;
  }
  
  // Convert to base64 using btoa (browser-compatible)
  let binaryString = '';
  for (let i = 0; i < bytes.length; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  return btoa(binaryString)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Resolves a relative URL to an absolute URL (browser environment)
 *
 * @param {string} url - The URL to resolve
 * @returns {string} The absolute URL
 */
export function resolveRelativeUrl(url: string): string {
  // Funny trick.
  const a = document.createElement("a");
  a.href = url;
  return a.href;
}

export class OAuthProvidersError extends Error {
  override name = "OAuthProvidersError";
  constructor() {
    super("OAuth providers not found");
  }
}

/**
 * Returns the authentication url for the selected OAuth Provider
 *
 * @example
 * ```ts
 *
 * const oauthParams = {
 *   authProviderId: "google",
 *   isCustomProvider: false,
 *   auth0Connection: undefined,
 *   scope: undefined,
 *   claims: undefined,
 *   mode: "redirect",
 *   redirectUrl: "https://your-url-path/oauth-return",
 *   expirationSeconds: 3000
 * };
 *
 * const turnkeyPublicKey = await this.initIframeStamper();
 * const oauthCallbackUrl = this.oauthCallbackUrl;
 * const oauthConfig = this.getOauthConfig() // Required OauthConfig
 * const usesRelativeUrl = true // Optional value to determine if we use a relative (or absolute) url for the `redirect_url`
 *
 * const oauthProviderUrl = getOauthProviderUrl({
 *   oauthParams,
 *   turnkeyPublicKey,
 *   oauthCallbackUrl,
 *   oauthConfig
 * })
 *
 * ```
 * @param {GetOauthProviderUrlArgs} args Required. The OAuth provider's auth parameters
 *
 * @returns {string} returns the OAuth provider's url
 */
export function getOauthProviderUrl(
  args: GetOauthProviderUrlArgs,
): string {
  const {
    oauthParams,
    turnkeyPublicKey,
    oauthCallbackUrl,
    oauthConfig,
    usesRelativeUrl = true,
  } = args;

  const {
    authProviderId,
    isCustomProvider,
    auth0Connection,
    scope: providedScope,
    claims: providedClaims,
    otherParameters: providedOtherParameters,
    mode,
    redirectUrl,
    expirationSeconds,
  } = oauthParams;

  const { codeChallenge, requestKey, authProviders } = oauthConfig;

  if (!authProviders) {
    throw new OAuthProvidersError();
  }

  let authProvider: AuthProviderConfig | undefined;
  for (let i = 0; i < authProviders.length; i++) {
    const provider = authProviders[i];
    if (provider.id === authProviderId &&
        !!provider.isCustomProvider === !!isCustomProvider) {
      authProvider = provider;
      break;
    }
  }

  if (!authProvider) {
    throw new Error(`No auth provider found with id ${authProviderId}`);
  }

  let scope: string | undefined = providedScope;
  let claims: string | undefined = providedClaims;
  let otherParameters: Record<string, string> | undefined =
    providedOtherParameters;

  if (!isCustomProvider) {
    const defaultCustomization =
      getDefaultProviderCustomization(authProviderId as KnownAuthProvider);
    scope ??= defaultCustomization?.scope;
    claims ??= defaultCustomization?.claims;
    otherParameters ??= defaultCustomization?.otherParameters;
  }
  if (!scope) {
    throw new Error(`Default scope not known for provider ${authProviderId}`);
  }
  const { authEndpoint, clientId } = authProvider;

  const nonce = getOauthNonce(turnkeyPublicKey);
  const stateObject: OauthState = {
    authProviderId,
    isCustomProvider,
    requestKey,
    turnkeyPublicKey,
    expirationSeconds,
    redirectUrl:
      mode === "redirect"
        ? usesRelativeUrl
          ? resolveRelativeUrl(redirectUrl)
          : redirectUrl
        : undefined,
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
    params[param] && authUrl.searchParams.append(param, params[param]);
  });

  const [urlPath, searchParams] = authUrl.href.split("?");

  return `${urlPath?.replace(/\/$/, "")}?${searchParams}`;
}
