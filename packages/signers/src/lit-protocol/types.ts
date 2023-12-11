import type { SmartAccountAuthenticator } from "@alchemy/aa-core";
import type { LitNodeClient } from "@lit-protocol/lit-node-client";
import {
  type AuthMethod,
  type SessionSigsMap,
  type SessionKeyPair,
} from "@lit-protocol/types";

export type LitAuthMethod = AuthMethod;
export type LitSessionSigsMap = SessionSigsMap;
export type LitUserMetadata = LitSessionSigsMap;
export interface LitConfig {
  pkpPublicKey: string;
  rpcUrl: string;
  inner?: LitNodeClient;
  network?: string;
  debug?: boolean;
}

export interface LitAuthenticateProps<
  C extends LitAuthMethod | LitSessionSigsMap
> {
  context: C;
  expiration?: string;
  sessionKeypair?: SessionKeyPair;
  chain?: string;
}

export type LitSmartAccountAuthenticator<
  C extends LitAuthMethod | LitSessionSigsMap
> = SmartAccountAuthenticator<
  LitAuthenticateProps<C>,
  LitUserMetadata,
  LitNodeClient | undefined
>;
