import {
  toHex,
  type TypedDataDefinition,
  type Address,
  type WalletRpcSchema,
  type Prettify,
  type EIP1193RequestFn,
  type EIP1193Events,
} from "viem";
import { BaseError } from "@alchemy/common";
import type { ExtractRpcMethod, BaseWalletClient } from "./types.js";
import { AccountNotFoundError } from "../../../aa-sdk/core/src/errors/account.js";
import { ChainNotFoundError } from "../../../aa-sdk/core/src/errors/client.js";
import type { PrepareCallsParams } from "./actions/prepareCalls.js";
import type { SmartWalletActions } from "./decorators/smartWalletActions.js";
import type { WalletServerViemRpcSchema } from "@alchemy/wallet-api-types/rpc";
import EventEmitter from "events"; // TODO(v5): do we need to polyfill this for browser?

export type SmartWalletClient1193Methods = [
  ExtractRpcMethod<WalletRpcSchema, "eth_chainId">,
  ExtractRpcMethod<WalletRpcSchema, "eth_accounts">,
  ExtractRpcMethod<WalletRpcSchema, "personal_sign">,
  ExtractRpcMethod<WalletRpcSchema, "eth_signTypedData_v4">,
  ExtractRpcMethod<WalletRpcSchema, "eth_sendTransaction">,
  ExtractRpcMethod<WalletRpcSchema, "wallet_sendCalls">,
  // We automatically get wallet_getCallsStatus & wallet_getCapabilities
  // from the underlying rpc w/o any translation.
  ...WalletServerViemRpcSchema,
];

export type SmartWalletClientEip1193Provider = Prettify<
  EIP1193Events & {
    request: EIP1193RequestFn<SmartWalletClient1193Methods>;
  }
>;

export const createEip1193ProviderFromClient = <
  TAccount extends Address | undefined = Address | undefined,
>(
  client: BaseWalletClient<SmartWalletActions<TAccount>>,
) => {
  // TODO(v5): implement any other supported events: https://eips.ethereum.org/EIPS/eip-1193#events
  const eventEmitter = new EventEmitter();

  // TODO(v5): revisit if we actually want to auto-connect the provider like this.
  (async () => {
    const account = await client.requestAccount();
    client.account = {
      type: "json-rpc",
      address: account.address,
    };
    eventEmitter.emit("connect", { chainId: client.chain.id });
  })();

  const request = (async ({ method, params }) => {
    switch (method) {
      case "eth_chainId": {
        return handler<"eth_chainId">(async () => {
          if (!client.chain.id) {
            throw new ChainNotFoundError();
          }
          return toHex(client.chain.id);
        })(params);
      }

      case "eth_accounts": {
        return handler<"eth_accounts">(async () => {
          if (!client.account) {
            throw new AccountNotFoundError();
          }
          return [client.account.address];
        })(params);
      }

      case "personal_sign": {
        return handler<"personal_sign">(async ([data, address]) => {
          if (!client.account) {
            throw new AccountNotFoundError();
          }
          if (
            address?.toLowerCase() !== client.account.address?.toLowerCase()
          ) {
            throw new BaseError(
              "Cannot sign for an address other than the current account.",
            );
          }
          return await client.signMessage({
            message: {
              raw: data,
            },
            account: client.account.address,
          });
        })(params);
      }

      case "eth_signTypedData_v4": {
        return handler<"eth_signTypedData_v4">(async ([address, tdJson]) => {
          if (!client.account) {
            throw new AccountNotFoundError();
          }
          if (address?.toLowerCase() !== client.account.address.toLowerCase()) {
            throw new Error(
              "Cannot sign for an address other than the current account.",
            );
          }
          return await client.signTypedData({
            account: client.account.address,
            ...(JSON.parse(tdJson) as TypedDataDefinition),
          });
        })(params);
      }

      // eslint-disable-next-line no-fallthrough
      case "wallet_sendTransaction":
      case "eth_sendTransaction": {
        return handler<"eth_sendTransaction">(async ([tx]) => {
          if (!client.account) {
            throw new AccountNotFoundError();
          }
          if (!client.chain) {
            throw new ChainNotFoundError();
          }
          const { to, data, value } = tx;
          if (!to) {
            throw new BaseError("'to' is required.");
          }
          const result = await client.sendCalls({
            calls: [{ to, data, value }],
            from: client.account.address,
            // TODO(v5): do we need to support any overrides here?
          } as PrepareCallsParams<TAccount>);
          const uoResult = await client.waitForCallsStatus({
            id: result.preparedCallIds[0],
          });
          const txHash = uoResult.receipts?.[0]?.transactionHash;
          if (!txHash) {
            throw new BaseError("Missing transaction hash.");
          }
          return txHash;
        })(params);
      }

      case "wallet_sendCalls": {
        return handler<"wallet_sendCalls">(async (_params) => {
          if (!_params) {
            throw new BaseError("Params are required.");
          }
          const [{ calls, capabilities, chainId }] = _params;
          if (!client.account) {
            throw new AccountNotFoundError();
          }
          if (!client.chain) {
            throw new ChainNotFoundError();
          }
          if (chainId !== toHex(client.chain.id)) {
            throw new BaseError("Invalid chain ID.");
          }
          if (calls.some((it) => it.to == null)) {
            throw new BaseError("'to' is required.");
          }
          const result = await client.sendCalls({
            calls: calls.map((c) => ({
              to: c.to!,
              data: c.data,
              value: c.value,
            })),
            from: client.account.address,
            capabilities,
          } as PrepareCallsParams<TAccount>);
          return {
            id: result.preparedCallIds[0],
          };
        })(params);
      }

      default:
        return client.request({ method: method as any, params: params as any });
    }
  }) as SmartWalletClientEip1193Provider["request"];

  return {
    on: eventEmitter.on.bind(eventEmitter),
    removeListener: eventEmitter.removeListener.bind(eventEmitter),
    request,
  };
};

// Viem's typing within a custom EIP1193 request function is surprisingly bad. This helps a lot
// by automatically casting the input params & ensuring that the result matches what is required.
const handler =
  <TMethod extends SmartWalletClient1193Methods[number]["Method"]>(
    handle: (
      params: ExtractRpcMethod<
        SmartWalletClient1193Methods,
        TMethod
      >["Parameters"],
    ) => Promise<
      ExtractRpcMethod<SmartWalletClient1193Methods, TMethod>["ReturnType"]
    >,
  ) =>
  (params: unknown) => {
    return handle(
      params as ExtractRpcMethod<
        SmartWalletClient1193Methods,
        TMethod
      >["Parameters"],
    );
  };
