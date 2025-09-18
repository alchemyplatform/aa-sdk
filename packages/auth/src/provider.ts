import EventEmitter from "events";
import {
  type TypedDataDefinition,
  ProviderRpcError,
  type WalletRpcSchema,
  type Prettify,
  type EIP1193RequestFn,
  type EIP1193Events,
} from "viem";
import {
  BaseError,
  InvalidRequestError,
  MethodUnsupportedError,
} from "@alchemy/common";
import type { ExtractRpcMethod } from "./types";
import type { AuthSession } from "./authSession.js";

export type AlchemyAuth1193Methods = [
  ExtractRpcMethod<WalletRpcSchema, "eth_accounts">,
  ExtractRpcMethod<WalletRpcSchema, "eth_requestAccounts">,
  ExtractRpcMethod<WalletRpcSchema, "personal_sign">,
  ExtractRpcMethod<WalletRpcSchema, "eth_signTypedData_v4">,
  ExtractRpcMethod<WalletRpcSchema, "eth_sign">,
  ExtractRpcMethod<WalletRpcSchema, "wallet_disconnect">,
];

export type AlchemyAuthEip1193Provider = Prettify<
  EIP1193Events & {
    request: EIP1193RequestFn<AlchemyAuth1193Methods>;
  }
>;

// TODO(jh): we can probably easily write tests for this by mocking the signer service fetch requests?
export const create1193Provider = (
  authSession: AuthSession,
): AlchemyAuthEip1193Provider => {
  const eventEmitter = new EventEmitter();

  const request = (async ({ method, params }) => {
    try {
      switch (method) {
        case "eth_requestAccounts":
        case "eth_accounts": {
          return handler<"eth_accounts">(async () => {
            const address = authSession.getAddress();
            return [address];
          })(params);
        }

        case "personal_sign": {
          return handler<"personal_sign">(async ([data, address]) => {
            if (
              address?.toLowerCase() !== authSession.getAddress().toLowerCase()
            ) {
              throw new InvalidRequestError(
                "Cannot sign for an address other than the current account.",
              );
            }
            return await authSession.signMessage({
              message: {
                raw: data,
              },
            });
          })(params);
        }

        case "eth_signTypedData_v4": {
          return handler<"eth_signTypedData_v4">(async ([address, tdJson]) => {
            if (
              address?.toLowerCase() !== authSession.getAddress().toLowerCase()
            ) {
              throw new InvalidRequestError(
                "Cannot sign for an address other than the current account.",
              );
            }
            return await authSession.signTypedData({
              ...(JSON.parse(tdJson) as TypedDataDefinition),
            });
          })(params);
        }

        case "eth_sign": {
          return handler<"eth_sign">(async ([address, data]) => {
            if (
              address?.toLowerCase() !== authSession.getAddress().toLowerCase()
            ) {
              throw new InvalidRequestError(
                "Cannot sign for an address other than the current account.",
              );
            }
            return await authSession.signMessage({
              message: {
                raw: data,
              },
            });
          })(params);
        }

        case "wallet_disconnect": {
          return handler<"wallet_disconnect">(async () => {
            await authSession.disconnect();
            eventEmitter.emit("disconnect");
          })(params);
        }

        default: {
          throw new MethodUnsupportedError(method);
        }
      }
    } catch (err) {
      if (err instanceof InvalidRequestError) {
        throw new ProviderRpcError(err, {
          code: -32600,
          shortMessage: err.message,
        });
      }
      if (err instanceof MethodUnsupportedError) {
        throw new ProviderRpcError(err, {
          code: -32601,
          shortMessage: err.message,
        });
      }
      const unexpectedErr =
        err instanceof BaseError ? err : new BaseError(`${err}`);
      throw new ProviderRpcError(unexpectedErr, {
        code: -32603,
        shortMessage: unexpectedErr.message,
      });
    }
  }) as AlchemyAuthEip1193Provider["request"];

  return {
    on: eventEmitter.on.bind(eventEmitter),
    removeListener: eventEmitter.removeListener.bind(eventEmitter),
    request,
  };
};

// Viem's typing within a custom EIP1193 request function is surprisingly bad. This helps a lot
// by automatically casting the input params & ensuring that the result matches what is required.
const handler =
  <TMethod extends AlchemyAuth1193Methods[number]["Method"]>(
    handle: (
      params: ExtractRpcMethod<AlchemyAuth1193Methods, TMethod>["Parameters"],
    ) => Promise<
      ExtractRpcMethod<AlchemyAuth1193Methods, TMethod>["ReturnType"]
    >,
  ) =>
  (params: unknown) => {
    return handle(
      params as ExtractRpcMethod<AlchemyAuth1193Methods, TMethod>["Parameters"],
    );
  };
