import { createClient, type Address, type Chain } from "viem";
import { smartWalletActions } from "./decorators/smartWalletActions.js";
import { type AlchemyTransport } from "@alchemy/common";
import type { SmartWalletClient, SmartWalletSigner } from "./types.js";
import { createInternalState } from "./internal.js";
import { isLocalAccount } from "./utils/assertions.js";

export type CreateSmartWalletClientParams = {
  signer: SmartWalletSigner;
  transport: AlchemyTransport;
  chain: Chain;
  account?: Address;
  paymaster?: {
    policyId?: string;
    policyIds?: string[];
  };
};

/**
 * Creates a smart wallet client with wallet API actions.
 *
 * @param {CreateSmartWalletClientParams} params - Parameters for creating the smart wallet client.
 * @param {SmartWalletSigner} params.account - The account to use for signing.
 * @param {AlchemyTransport} params.transport - The transport to use for RPC calls.
 * @param {Chain} params.chain - The blockchain network to connect to.
 * @param {string[]} params.policyIds - Optional policy IDs for paymaster service.
 * @returns {WalletClient} A wallet client extended with smart wallet actions.
 */
export const createSmartWalletClient = ({
  signer,
  transport,
  chain,
  // If no account address is provided, the client defaults to using the signer's address via EIP-7702.
  account = isLocalAccount(signer) ? signer.address : signer.account.address,
  paymaster: { policyId, policyIds } = {},
}: CreateSmartWalletClientParams): SmartWalletClient => {
  const _policyIds = [...(policyId ? [policyId] : []), ...(policyIds ?? [])];

  return createClient({
    account,
    transport,
    chain,
    name: "alchemySmartWalletClient",
  })
    .extend(() => ({
      policyIds: _policyIds,
      internal: createInternalState(),
      owner: signer,
    }))
    .extend(smartWalletActions);
};
