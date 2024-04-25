import type { SmartAccountAuthenticator } from "@alchemy/aa-core";
import type { LitNodeClient } from "@lit-protocol/lit-node-client";

import {
  type AuthMethod,
  type SessionSigsMap,
  type SessionKeyPair,
  type AuthSig,
  type LIT_NETWORKS_KEYS,
} from "@lit-protocol/types";

export type LitAuthMethod = AuthMethod;
export type LitSessionSigsMap = SessionSigsMap;
export type LitUserMetadata = LitSessionSigsMap;
export interface LitConfig {
  pkpPublicKey: string;
  rpcUrl: string;
  inner?: LitNodeClient;
  network?: LIT_NETWORKS_KEYS;
  debug?: boolean;
}

interface LitCapacityCreditsReq {
  dAppOwnerWallet: any; // typing as any to avoid ethers import
  capacityTokenId?: string;
  delegateeAddresses?: string[];
  uses?: string;
  domain?: string;
  expiration?: string;
  statement?: string;
}

interface LitCapacityCreditsRes {
  litResource: any;
  capacityDelegationAuthSig: AuthSig;
}

/**
 * Properties for configuring authentication operations
 * see here for chain identifiers if none is passed `ethereum` will be used as the default.
 * https://developer.litprotocol.com/v3/resources/supported-chains/
 */
export interface LitAuthenticateProps<
  C extends LitAuthMethod | LitSessionSigsMap
> {
  context: C;
  expiration?: string;
  sessionKeypair?: SessionKeyPair;
  chain?: string;

  /**
   * parameters to pass to {@link capacityCreditNeeded}
   */
  capacityCreditNeededParams?: LitCapacityCreditsReq;

  /**
   * Callback to provide a Capacity Delegation AuthSig
   * Only required if not providing a {@link LitSessionSigsMap}
   *
   * @param params
   * @returns {Promise<LitCapacityCreditsRes>}
   */
  capacityCreditNeeded?: (
    params: LitCapacityCreditsReq
  ) => Promise<LitCapacityCreditsRes>;
}

export type LitSmartAccountAuthenticator<
  C extends LitAuthMethod | LitSessionSigsMap
> = SmartAccountAuthenticator<
  LitAuthenticateProps<C>,
  LitUserMetadata,
  LitNodeClient | undefined
>;
