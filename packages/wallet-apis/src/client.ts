import {
  createWalletClient,
  type Chain,
  type JsonRpcAccount,
  type LocalAccount,
} from "viem";
import { smartWalletActions } from "./decorators/smartWalletActions.js";
import type { AlchemyTransport } from "@alchemy/common";

export type CreateSmartWalletClientParams = {
  account: LocalAccount | JsonRpcAccount;
  transport: AlchemyTransport;
  chain: Chain;
  policyIds?: string[];
};

/**
 * Creates a smart wallet client with wallet API actions.
 *
 * @param {CreateSmartWalletClientParams} params - Parameters for creating the smart wallet client.
 * @param {LocalAccount | JsonRpcAccount} params.account - The account to use for signing.
 * @param {AlchemyTransport} params.transport - The transport to use for RPC calls.
 * @param {Chain} params.chain - The blockchain network to connect to.
 * @param {string[]} params.policyIds - Optional policy IDs for paymaster service.
 * @returns {WalletClient} A wallet client extended with smart wallet actions.
 */
// TODO(v5): do we actually want to provide this? or just instruct consumers to extend their own wallet client w/ the actions?
export const createSmartWalletClient = ({
  account,
  transport,
  chain,
  policyIds,
}: CreateSmartWalletClientParams) => {
  return createWalletClient({
    account,
    transport,
    chain,
  }).extend(smartWalletActions({ policyIds }));
};
