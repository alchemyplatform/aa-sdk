import {
  createClient,
  type Address,
  type Chain,
  type LocalAccount,
  createWalletClient,
} from "viem";
import {
  smartWalletActions,
  type SmartWalletActions,
} from "./decorators/smartWalletActions.js";
import { type AlchemyTransport } from "@alchemy/common";
import type { BaseWalletClient, SignerClient } from "./types.js";
import { createInternalState } from "./internal.js";
import {
  createEip1193ProviderFromClient,
  type SmartWalletClientEip1193Provider,
} from "./provider.js";

export type CreateSmartWalletClientParams<
  TAccount extends Address | undefined = Address | undefined,
> = {
  signer: LocalAccount | SignerClient;
  transport: AlchemyTransport;
  chain: Chain;
  account?: TAccount;
  // TODO(v5): Reconsider if the client store store the policyIds, especially as
  // new paymaster fields (i.e. for erc-20 support) are introduced. It might make
  // more sense for them to be stored at a higher level like in the wagmi config
  // or hooks.
  policyId?: string;
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
export const createSmartWalletClient = <
  TAccount extends Address | undefined = Address | undefined,
>({
  account,
  transport,
  chain,
  signer,
  policyId,
  policyIds,
}: CreateSmartWalletClientParams<TAccount>): BaseWalletClient<
  SmartWalletActions<TAccount>
> & { getProvider: () => SmartWalletClientEip1193Provider } => {
  const _policyIds = [...(policyId ? [policyId] : []), ...(policyIds ?? [])];

  // If the signer is a `LocalAccount` wrap it inside of a client now so
  // downstream actions can just use `getAction` to get signing actions
  // and `signerClient.account.address` to access the address.
  const signerClient =
    "request" in signer
      ? signer
      : createWalletClient({
          account: signer,
          transport,
          chain,
        });

  return createClient({
    account,
    transport,
    chain,
  })
    .extend(() => ({
      policyIds: _policyIds,
      internal: createInternalState(),
    }))
    .extend(smartWalletActions<TAccount>(signerClient))
    .extend((_client) => ({
      getProvider: () => createEip1193ProviderFromClient<TAccount>(_client),
    }));
};
