import {
  createClient,
  type Address,
  type Chain,
  type Client,
  type LocalAccount,
  type ParseAccount,
  type Transport,
  createWalletClient,
} from "viem";
import {
  smartWalletActions,
  type SmartWalletActions,
} from "./decorators/smartWalletActions.js";
import { type AlchemyTransport } from "@alchemy/common";
import type { SignerClient } from "./types.js";
import type { WalletServerViemRpcSchema } from "@alchemy/wallet-api-types/rpc";
import { createInternalState } from "./internal.js";

export type CreateSmartWalletClientParams<
  TAccount extends Address | undefined = Address | undefined,
> = {
  signer: LocalAccount | SignerClient;
  transport: AlchemyTransport;
  chain: Chain;
  account?: TAccount;
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
}: CreateSmartWalletClientParams<TAccount>): Client<
  Transport,
  Chain,
  ParseAccount<TAccount>,
  WalletServerViemRpcSchema,
  SmartWalletActions<TAccount>
> => {
  const baseClient = createClient({ account, transport, chain });

  // If the signer is a `LocalAccount` wrap it inside of a client now so
  // downstream actions can just use `getAction` to get signing actions
  // and `signer.account.address` to access the address.
  const signerClient =
    "request" in signer
      ? signer
      : createWalletClient({
          account: signer,
          transport,
          chain,
        });

  const _policyIds = [
    ...(policyId ? [policyId] : []),
    ...(policyIds?.length ? policyIds : []),
  ];

  return baseClient
    .extend(() => ({
      policyIds: _policyIds,
      internal: createInternalState(),
    }))
    .extend(smartWalletActions(signerClient));
};
