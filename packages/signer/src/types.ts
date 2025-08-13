import type { Address } from "viem";

export type User = {
  email?: string;
  orgId: string;
  userId: string;
  address: Address;
  solanaAddress?: string;
  credentialId?: string;
  idToken?: string;
  claims?: Record<string, unknown>;
};

export type AuthMethods = {
  email?: string;
  oauthProviders: OauthProviderInfo[];
  passkeys: PasskeyInfo[];
};

export type OauthProviderInfo = {
  providerId: string;
  issuer: string;
  providerName?: string;
  userDisplayName?: string;
};

export type PasskeyInfo = {
  authenticatorId: string;
  name: string;
  createdAt: number;
};

export type AddOauthProviderParams = {
  providerName: string;
  oidcToken: string;
};

/**
 * Re-exporting a type defined internally in Turnkey's SDK (where it's called
 * TStamper).
 */
export type TurnkeyStamper = {
  stamp: (input: string) => Promise<TurnkeyStamp>;
  clear?(): void;
};

/**
 * The methods we will use from the flavor of stamper that exposes a public TEK
 * and becomes fully initialized upon receiving a "credential bundle" which is
 * an encrypted private key. Describes both IFrameStamper and NativeTEKStamper.
 */
export type TurnkeyTekStamper = TurnkeyStamper & {
  /**
   * Initializes the stamper and returns its public key.
   */
  init: () => Promise<string>;
  injectCredentialBundle: (bundle: string) => Promise<boolean>;
};

export type CreateTekStamperFn = () => Promise<TurnkeyTekStamper>;

/**
 * Creates a flavor of stamper which stamps requests by directly using a private
 * key accessed with WebAuthn (e.g. passkeys).
 */
export type CreateWebAuthnStamperFn = (
  params: CreateWebAuthnStamperParams,
) => Promise<TurnkeyStamper>;

export type CreateWebAuthnStamperParams = {
  credentialId: string | undefined;
};

export type TurnkeyStamp = {
  stampHeaderName: string;
  stampHeaderValue: string;
};
