import { sha256 } from "viem";
import type { KnownAuthProvider } from "./signer";

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

const DEFAULT_SCOPE_AND_CLAIMS: Record<KnownAuthProvider, ScopeAndClaims> = {
  google: { scope: "openid email" },
  apple: { scope: "openid email" },
  facebook: { scope: "openid email" },
  auth0: { scope: "openid email" },
};

/**
 * Returns the default scope and claims when using a known auth provider
 *
 * @param {string} knownAuthProviderId id of a known auth provider, e.g. "google"
 * @returns {ScopeAndClaims | undefined} default scope and claims
 */
export function getDefaultScopeAndClaims(
  knownAuthProviderId: KnownAuthProvider
): ScopeAndClaims | undefined {
  return DEFAULT_SCOPE_AND_CLAIMS[knownAuthProviderId];
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
