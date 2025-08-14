import {
  createWalletClient,
  type Address,
  type Chain,
  type JsonRpcAccount,
  type LocalAccount,
} from "viem";
import { smartWalletActions } from "./decorators/smartWalletActions.js";
import type { AlchemyTransport } from "@alchemy/common";

export type CreateSmartWalletClientParams<
  TAccount extends Address | undefined = Address | undefined,
> = {
  account: LocalAccount | JsonRpcAccount;
  transport: AlchemyTransport;
  chain: Chain;
  policyIds?: string[];
  // TODO(jh): unsure how i feel about this, but it gets us the typesafety of not having to specify a `from` address on every call.
  // do the ergonomics of this feel better or worse than having to pass the `signer` or `owner` separately from the `account`?
  // or should we not care about typesafety of including the `from` address and just try to use the account that's active
  // in the internal cache & throw an error if there's no account or from address?
  smartAccountAddress: TAccount;
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
export const createSmartWalletClient = <
  TAccount extends Address | undefined = Address | undefined,
>({
  account,
  transport,
  chain,
  policyIds,
  smartAccountAddress,
}: CreateSmartWalletClientParams<TAccount>) => {
  return createWalletClient({
    account,
    transport,
    chain,
  }).extend(smartWalletActions({ policyIds, smartAccountAddress }));
};
