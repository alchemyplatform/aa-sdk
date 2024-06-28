import type { Address, Chain } from "viem";
import type {
  CredentialSigner,
  CredentialCreator,
  CredentialAssertion,
  CredentialAttestation,
} from "@0xpass/models";
import type { Network } from "@0xpass/passport";

export interface PassportAuthenticationParams {
  username: string;
  userDisplayName?: string;
  chain: Chain;
  fallbackProvider: string;
  network?: Network;
}

export type PassportHeaders = {
  "X-Encrypted-Key"?: string;
  "X-Scope-Id"?: string;
  "X-Encrypted-User"?: string;
  "X-Encrypted-Session"?: string;
  "X-Encrypted-Webauthn-Signature"?: string;
  "X-Encrypted-Key-Signature"?: string;
};

export type PassportUserInfo = {
  authenticatedHeaders: PassportHeaders;
  addresses: Address[];
};

export type SignerWithOptionalCreator = CredentialSigner<
  CredentialAssertion,
  any
> &
  Partial<CredentialCreator<CredentialAttestation, any>>;

export type PassportClientParams = {
  scope_id: string;
  signer: SignerWithOptionalCreator;
  network?: Network;
  fallbackProvider: string;
  enableSession?: boolean;
};
