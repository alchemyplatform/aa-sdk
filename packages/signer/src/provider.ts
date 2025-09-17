import type { Signer } from "./signer";
import EventEmitter from "events";
import {
  type TypedDataDefinition,
  ProviderRpcError,
  type WalletRpcSchema,
  type Prettify,
  type EIP1193RequestFn,
  type EIP1193Events,
} from "viem";
import { BaseError, InvalidRequestError } from "@alchemy/common";
import type { ExtractRpcMethod } from "./types";

// TODO(jh): better name
export type AlchemyAuth1193Methods = [
  ExtractRpcMethod<WalletRpcSchema, "eth_accounts">,
  ExtractRpcMethod<WalletRpcSchema, "eth_requestAccounts">,
  ExtractRpcMethod<WalletRpcSchema, "personal_sign">,
  ExtractRpcMethod<WalletRpcSchema, "eth_signTypedData_v4">,
  // TODO(jh): impl handling for these:
  ExtractRpcMethod<WalletRpcSchema, "eth_sign">,
  ExtractRpcMethod<WalletRpcSchema, "eth_signTransaction">,
  // TODO(jh): implement the chain & transaction methods elsewhere if this provider is staying in the signer pkg?
];

// TODO(jh): better name
export type AlchemyAuthEip1193Provider = Prettify<
  EIP1193Events & {
    request: EIP1193RequestFn<AlchemyAuth1193Methods>;
  }
>;

export const create1193Provider = (signer: Signer): unknown => {
  // TODO(v5): implement any other supported events: https://eips.ethereum.org/EIPS/eip-1193#events
  const eventEmitter = new EventEmitter();

  const request = (async ({ method, params }) => {
    try {
      switch (method) {
        case "eth_requestAccounts":
        case "eth_accounts": {
          return handler<"eth_accounts">(async () => {
            const address = signer.getAddress();
            return [address];
          })(params);
        }

        case "personal_sign": {
          return handler<"personal_sign">(async ([data, address]) => {
            if (address?.toLowerCase() !== signer.getAddress().toLowerCase()) {
              throw new InvalidRequestError(
                "Cannot sign for an address other than the current account.",
              );
            }
            return await signer.signMessage({
              message: {
                raw: data,
              },
            });
          })(params);
        }

        case "eth_signTypedData_v4": {
          return handler<"eth_signTypedData_v4">(async ([address, tdJson]) => {
            if (address?.toLowerCase() !== signer.getAddress().toLowerCase()) {
              throw new InvalidRequestError(
                "Cannot sign for an address other than the current account.",
              );
            }
            return await signer.signTypedData({
              ...(JSON.parse(tdJson) as TypedDataDefinition),
            });
          })(params);
        }

        // TODO(jh): the wagmi connector using this provider def
        // will need to be able to send transactions. do we have
        // access to a node rpc here to do that? or should it
        // be handled elsewhere and this provider is soley
        // responsible for signing?

        // TODO(jh): will the transport given to the authClient only be
        // a signer service transport? if so, it might actually make sense
        // for the auth client 1193 provider to live in the wagmi-core pkg,
        // since that will also have access to the node rpc transport from
        // the wagmi config. that probably makes sense if the wagmi
        // connectors are going to be where we control routing b/w
        // different transports for different methods?

        // TODO(jh): maybe actually it's okay to only support a couple of methods here,
        // then have another provider in the wagmi-core pkg that handles everything else?

        // TODO(jh): maybe another option is that you can pass the node rpc transport to
        // this function, then this can stay here and handle everything?

        default:
          // TODO(jh): do underlying methods automatically fall through to a node rpc,
          // or is method routing handled within the wagmi connector?
          // If here, where do we get the node rpc transport from?
          // return signer.request({
          //   method: method as any,
          //   params: params as any,
          // });
          throw new Error(`Method unsupported by signer: ${method}`);
      }
    } catch (err) {
      // TODO(jh): handle errors that we are expecting from the signer.
      //   if (err instanceof ChainNotFoundError) {
      //     throw new ProviderRpcError(err, {
      //       code: 4901,
      //       shortMessage: err.message,
      //     });
      //   }
      //   if (err instanceof AccountNotFoundError) {
      //     throw new ProviderRpcError(err, {
      //       code: 4100,
      //       shortMessage: err.message,
      //     });
      //   }
      //   if (err instanceof InvalidRequestError) {
      //     throw new ProviderRpcError(err, {
      //       code: -32600,
      //       shortMessage: err.message,
      //     });
      //   }
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
