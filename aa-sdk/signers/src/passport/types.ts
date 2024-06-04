import type { Address, Chain } from "viem";
import type {
  CredentialSigner,
  CredentialCreator,
  CredentialAssertion,
  CredentialAttestation,
} from "@0xpass/models";

export interface PassportAuthenticationParams {
  username: string;
  userDisplayName: string;
  chain: Chain;
  fallbackProvider: string;
  endpoint?: string;
}

export type PassportAuthenticatedHeaders = {
  "x-encrypted-key": string;
  "x-session": string;
};

export type PassportUserInfo = {
  authenticatedHeaders: PassportAuthenticatedHeaders;
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
  endpoint?: string;
  enclave_public_key?: string;
  fallbackProvider: string;
};
