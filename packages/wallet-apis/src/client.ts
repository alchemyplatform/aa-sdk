import { createClient, type Address, type Chain } from "viem";
import { smartWalletActions } from "./decorators/smartWalletActions.js";
import { type AlchemyTransport } from "@alchemy/common";
import type { SmartWalletClient, SmartWalletSigner } from "./types.js";
import { createInternalState } from "./internal.js";

export type CreateSmartWalletClientParams<
  TAccount extends Address | undefined = Address | undefined,
> = {
  signer: SmartWalletSigner;
  transport: AlchemyTransport;
  chain: Chain;
  account?: TAccount;
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
export const createSmartWalletClient = <
  TAccount extends Address | undefined = Address | undefined,
>({
  account,
  transport,
  chain,
  signer,
  paymaster: { policyId, policyIds } = {},
}: CreateSmartWalletClientParams<TAccount>): SmartWalletClient<TAccount> => {
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
    .extend(smartWalletActions<TAccount>);
};
