import { sha256 } from "viem";

/**
 * Turnkey requires the nonce in the id token to be in this format.
 *
 * @param {string} turnkeyPublicKey key from a Turnkey iframe
 * @returns {string} nonce to be used in OIDC
 */
export function getOauthNonce(turnkeyPublicKey: string): string {
  return sha256(new TextEncoder().encode(turnkeyPublicKey)).slice(2);
}

export type ScopeAndClaims = {
  scope: string;
  claims?: string;
};

const DEFAULT_SCOPE_AND_CLAIMS: Record<string, ScopeAndClaims> = {
  google: { scope: "openid email" },
  apple: { scope: "openid email" },
  facebook: { scope: "openid email" },
  twitch: {
    scope: "openid user:read:email",
    claims: JSON.stringify({ id_token: { email: null } }),
  },
};

/**
 * Returns the default scope and claims when using a known auth provider
 *
 * @param {string} knownAuthProviderId id of a known auth provider, e.g. "google"
 * @returns {ScopeAndClaims | undefined} default scope and claims
 */
export function getDefaultScopeAndClaims(
  knownAuthProviderId: string
): ScopeAndClaims | undefined {
  return DEFAULT_SCOPE_AND_CLAIMS[knownAuthProviderId];
}
