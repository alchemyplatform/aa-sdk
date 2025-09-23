import { OAuthProvidersNotFoundError } from "./errors.js";
import { sha256 } from "viem";
import type {
  AuthProviderConfig,
  AuthProviderCustomization,
  GetOauthProviderUrlArgs,
  KnownAuthProvider,
  OauthState,
} from "./types";
import { z } from "zod";

export const UserSchema = z.object({
  email: z.string().optional(),
  orgId: z.string(),
  userId: z.string(),
  address: z.string(),
  solanaAddress: z.string().optional(),
  credentialId: z.string().optional(),
  idToken: z.string().optional(),
  claims: z.record(z.unknown()).optional(),
});

export const AuthSessionStateSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("passkey"),
    user: UserSchema,
    expirationDateMs: z.number(),
    credentialId: z.string().optional(),
  }),
  z.object({
    type: z.enum(["email", "oauth", "otp"]),
    bundle: z.string(),
    user: UserSchema,
    expirationDateMs: z.number(),
  }),
]);

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
export function base64UrlEncode(
  challenge: ArrayBuffer | Uint8Array | string,
): string {
  let bytes: Uint8Array;

  if (typeof challenge === "string") {
    bytes = new TextEncoder().encode(challenge);
  } else if (challenge instanceof ArrayBuffer) {
    bytes = new Uint8Array(challenge);
  } else {
    bytes = challenge;
  }

  // Convert to base64 using btoa (browser-compatible)
  let binaryString = "";
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

/**
 * Reads and removes the specified query params from the URL.
 *
 * @param {T} keys object whose values are the query parameter keys to read and
 * remove
 * @returns {{ [K in keyof T]: string | undefined }} object with the same keys
 * as the input whose values are the values of the query params.
 */
function getAndRemoveQueryParams<T extends Record<string, string>>(
  keys: T,
): { [K in keyof T]: string | undefined } {
  const url = new URL(window.location.href);
  const result: Record<string, string | undefined> = {};
  let foundQueryParam = false;
  for (const [key, param] of Object.entries(keys)) {
    const value = url.searchParams.get(param) ?? undefined;
    foundQueryParam ||= value != null;
    result[key] = value;
    url.searchParams.delete(param);
  }
  if (foundQueryParam) {
    window.history.replaceState(window.history.state, "", url.toString());
  }
  return result as { [K in keyof T]: string | undefined };
}

/**
 * Attempts to extract OAuth callback parameters from the current URL.
 * Returns the extracted parameters if this appears to be an OAuth callback,
 * or null if no OAuth parameters are found.
 *
 * @returns {object | null} OAuth callback parameters or null if not a callback
 */
export function extractOAuthCallbackParams() {
  const qpStructure = {
    status: "alchemy-status",
    oauthBundle: "alchemy-bundle",
    oauthOrgId: "alchemy-org-id",
    idToken: "alchemy-id-token",
    isSignup: "aa-is-signup",
    otpId: "alchemy-otp-id",
    email: "alchemy-email",
    authProvider: "alchemy-auth-provider",
    oauthError: "alchemy-error",
  };

  const {
    status,
    oauthBundle,
    oauthOrgId,
    idToken,
    isSignup,
    otpId,
    email,
    authProvider,
    oauthError,
  } = getAndRemoveQueryParams(qpStructure);

  // Check if this is an OAuth callback by looking for required OAuth parameters
  if (oauthBundle && oauthOrgId && idToken) {
    return {
      status: "SUCCESS" as const,
      bundle: oauthBundle,
      orgId: oauthOrgId,
      idToken,
      isSignup: isSignup === "true",
    };
  }

  // Check for OAuth error
  if (oauthError) {
    return {
      status: "ERROR" as const,
      error: oauthError,
    };
  }

  // Check for account linking prompt
  if (
    status === "ACCOUNT_LINKING_CONFIRMATION_REQUIRED" &&
    idToken &&
    email &&
    authProvider &&
    otpId &&
    oauthOrgId
  ) {
    return {
      status: "ACCOUNT_LINKING_CONFIRMATION_REQUIRED" as const,
      idToken,
      email,
      providerName: authProvider,
      otpId,
      orgId: oauthOrgId,
    };
  }

  return null;
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
export function getOauthProviderUrl(args: GetOauthProviderUrlArgs): string {
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
    throw new OAuthProvidersNotFoundError();
  }

  let authProvider: AuthProviderConfig | undefined;
  for (let i = 0; i < authProviders.length; i++) {
    const provider = authProviders[i];
    if (
      provider.id === authProviderId &&
      !!provider.isCustomProvider === !!isCustomProvider
    ) {
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
    const defaultCustomization = getDefaultProviderCustomization(
      authProviderId as KnownAuthProvider,
    );
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
        ? usesRelativeUrl && redirectUrl // added check here that redirectUrl is defined
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
