import {
  type AuthMethod,
  type SessionSigsMap,
  type SessionKeyPair,
} from "@lit-protocol/types";

export type LitAuthMethod = AuthMethod;
export type LitSessionSigsMap = SessionSigsMap;

export interface LitAccountAuthenticatorParams {
  pkpPublicKey: string;
  rpcUrl: string;
  network?: string;
  debug?: boolean;
}

export interface LITAuthenticateProps<
  C extends LitAuthMethod | LitSessionSigsMap
> {
  context: C;
  expiration?: string;
  sessionKeypair?: SessionKeyPair;
  chain?: string;
}
