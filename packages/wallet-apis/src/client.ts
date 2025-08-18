import {
  createClient,
  type Address,
  type Chain,
  type LocalAccount,
  createWalletClient,
  toHex,
  type TypedDataDefinition,
  sliceHex,
  type WalletSendCallsReturnType,
  type WalletSendCallsParameters,
} from "viem";
import {
  smartWalletActions,
  type SmartWalletActions,
} from "./decorators/smartWalletActions.js";
import { BaseError, type AlchemyTransport } from "@alchemy/common";
import type {
  BaseWalletClient,
  ExtractRpcMethod,
  SignerClient,
  SmartWalletClient1193Methods,
} from "./types.js";
import { createInternalState } from "./internal.js";
import { AccountNotFoundError } from "../../../aa-sdk/core/src/errors/account.js";
import { ChainNotFoundError } from "../../../aa-sdk/core/src/errors/client.js";
import type { SmartWalletClientEip1193Provider } from "./types.js";
import type { PrepareCallsParams } from "./actions/prepareCalls.js";
import EventEmitter from "events"; // TODO(jh): do we need to polyfill this for browser?

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
  const _policyIds = [
    ...(policyId ? [policyId] : []),
    ...(policyIds?.length ? policyIds : []),
  ];

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

  const baseClient: BaseWalletClient<SmartWalletActions<TAccount>> =
    createClient({
      account,
      transport,
      chain,
    })
      .extend(() => ({
        policyIds: _policyIds,
        internal: createInternalState(),
      }))
      .extend(smartWalletActions(signerClient));

  return {
    ...baseClient,
    // TODO(jh): pull this out to another file so this doesn't get so large?
    getProvider: () => {
      // TODO(v5): actually emit the required events: https://eips.ethereum.org/EIPS/eip-1193#events
      const eventEmitter = new EventEmitter();

      const request = (async ({ method, params }) => {
        // TODO(jh): try harder to make this easier to be typesafe.
        switch (method) {
          case "eth_chainId": {
            if (!baseClient.chain.id) {
              throw new ChainNotFoundError();
            }
            return toHex(baseClient.chain.id) satisfies ExtractRpcMethod<
              SmartWalletClient1193Methods,
              "eth_chainId"
            >["ReturnType"];
          }

          case "eth_accounts": {
            if (!account) {
              throw new AccountNotFoundError();
            }
            return [account] satisfies ExtractRpcMethod<
              SmartWalletClient1193Methods,
              "eth_accounts"
            >["ReturnType"];
          }

          case "personal_sign": {
            if (!account) {
              throw new AccountNotFoundError();
            }
            const [data, address] = params as ExtractRpcMethod<
              SmartWalletClient1193Methods,
              "personal_sign"
            >["Parameters"];

            if (address?.toLowerCase() !== account?.toLowerCase()) {
              throw new BaseError(
                "Cannot sign for an address other than the current account.",
              );
            }
            return (await baseClient.signMessage({
              message: {
                raw: data,
              },
              account,
            })) satisfies ExtractRpcMethod<
              SmartWalletClient1193Methods,
              "personal_sign"
            >["ReturnType"];
          }

          case "eth_signTypedData_v4": {
            if (!account) {
              throw new AccountNotFoundError();
            }
            const [address, tdJson] = params as ExtractRpcMethod<
              SmartWalletClient1193Methods,
              "eth_signTypedData_v4"
            >["Parameters"];

            if (address?.toLowerCase() !== account.toLowerCase()) {
              throw new Error(
                "Cannot sign for an address other than the current account.",
              );
            }
            return (await baseClient.signTypedData({
              account,
              ...(JSON.parse(tdJson) as TypedDataDefinition),
            })) satisfies ExtractRpcMethod<
              SmartWalletClient1193Methods,
              "eth_signTypedData_v4"
            >["ReturnType"];
          }

          // eslint-disable-next-line no-fallthrough
          case "wallet_sendTransaction":
          case "eth_sendTransaction": {
            if (!account) {
              throw new AccountNotFoundError();
            }
            if (!baseClient.chain) {
              throw new ChainNotFoundError();
            }

            const [tx] = params as ExtractRpcMethod<
              SmartWalletClient1193Methods,
              "eth_sendTransaction"
            >["Parameters"];

            const { to, data, value } = tx;

            if (!to) {
              throw new BaseError("'to' is required.");
            }

            // TODO(jh): make a type guard to fix this w/ an assertion?
            // TS a bit unhappy b/c it doesn't believe that the account has to be defined.
            const result = await baseClient.sendCalls({
              calls: [{ to, data, value }],
              // TODO(v5): do we need to support any overrides here?
            } as PrepareCallsParams<TAccount>);

            const uoHash = sliceHex(result.preparedCallIds[0], 32); // TODO(v5): do we really want to do this?

            // TODO(jh): is it weird that `sendTransaction` is returning
            // a UO hash instead of txn hash? what did we do in v4?
            return uoHash satisfies ExtractRpcMethod<
              SmartWalletClient1193Methods,
              "eth_sendTransaction"
            >["ReturnType"];
          }

          case "wallet_sendCalls": {
            if (!account) {
              throw new AccountNotFoundError();
            }
            if (!baseClient.chain) {
              throw new ChainNotFoundError();
            }

            const [{ calls, capabilities, chainId }] =
              params as WalletSendCallsParameters;

            if (chainId !== toHex(baseClient.chain.id)) {
              throw new BaseError("Invalid chain ID.");
            }

            if (calls.some((it) => it.to == null)) {
              throw new BaseError("'to' is required.");
            }

            // TODO(jh): make a type guard to fix this w/ an assertion?
            // TS a bit unhappy b/c it doesn't believe that the account has to be defined. ????
            const result = await baseClient.sendCalls({
              calls: calls.map((c) => ({
                to: c.to!,
                data: c.data,
                value: c.value,
              })),
              // TODO(jh): parse the capabilities first.
              capabilities,
            } as PrepareCallsParams<TAccount>);

            return {
              id: result.preparedCallIds[0],
            } satisfies WalletSendCallsReturnType;
          }

          default:
            // @ts-ignore - TODO(jh): can even this be typesafe w/ the `WalletServerViemRpcSchema`?
            return baseClient.request({ method, params });
        }
      }) as SmartWalletClientEip1193Provider["request"];

      return {
        on: eventEmitter.on.bind(eventEmitter),
        removeListener: eventEmitter.removeListener.bind(eventEmitter),
        request,
      };
    },
  };
};
