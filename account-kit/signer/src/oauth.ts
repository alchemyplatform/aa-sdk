import type { KnownAuthProvider } from "./signer";

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
  knownAuthProviderId: KnownAuthProvider
): AuthProviderCustomization | undefined {
  return DEFAULT_PROVIDER_CUSTOMIZATION[knownAuthProviderId];
}

/**
 * "openid" is a required scope in the OIDC protocol. Insert it if the user
 * forgot.
 *
 * @param {string} scope scope param which may be missing "openid"
 * @returns {string} scope which most definitely contains "openid"
 */
export function addOpenIdIfAbsent(scope: string): string {
  return scope.match(/\bopenid\b/) ? scope : `openid ${scope}`;
}
