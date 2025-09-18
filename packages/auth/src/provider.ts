import EventEmitter from "events";
import {
  type TypedDataDefinition,
  ProviderRpcError,
  type WalletRpcSchema,
  type Prettify,
  type EIP1193RequestFn,
  type EIP1193Events,
  type Client,
  serializeTransaction,
  keccak256,
  type TransactionSerializable,
  parseSignature,
  assertCurrentChain,
  formatTransactionRequest,
} from "viem";
import { BaseError, InvalidRequestError } from "@alchemy/common";
import type { ExtractRpcMethod } from "./types";
import type { AuthSession } from "./authSession.js";
import { getTransactionCount, prepareTransactionRequest } from "viem/actions";

export type AlchemyAuth1193Methods = [
  ExtractRpcMethod<WalletRpcSchema, "eth_accounts">,
  ExtractRpcMethod<WalletRpcSchema, "eth_requestAccounts">,
  ExtractRpcMethod<WalletRpcSchema, "personal_sign">,
  ExtractRpcMethod<WalletRpcSchema, "eth_signTypedData_v4">,
  ExtractRpcMethod<WalletRpcSchema, "eth_sign">,
  ExtractRpcMethod<WalletRpcSchema, "eth_signTransaction">,
  ExtractRpcMethod<WalletRpcSchema, "eth_sendTransaction">,
  ExtractRpcMethod<WalletRpcSchema, "wallet_sendCalls">,
  // TODO(jh): if we keep wallet_sendCalls, we probably should also impl wallet_getCallsStatus.
  // TODO(jh): should we track chain id here? or just do it on the wagmi connector & underlying provider?
  // or should the wagmi connector actually call US (the provider) to get the chain, then we just need to track it in here?
  // ExtractRpcMethod<WalletRpcSchema, "eth_chainId">,
  // TODO(jh): do we need to do anything for these?
  // ExtractRpcMethod<WalletRpcSchema, "wallet_estimateGas">,
  // ExtractRpcMethod<WalletRpcSchema, "wallet_addEthereumChain">,
  // ExtractRpcMethod<WalletRpcSchema, "wallet_switchEthereumChain">,
  // ExtractRpcMethod<WalletRpcSchema, "wallet_connect">,
  // ExtractRpcMethod<WalletRpcSchema, "wallet_disconnect">,
];

export type AlchemyAuthEip1193Provider = Prettify<
  EIP1193Events & {
    request: EIP1193RequestFn<AlchemyAuth1193Methods>;
  }
>;

// TODO(jh): we can probably easily write tests for this by mocking the signer service fetch requests?
export const create1193Provider = (
  authSession: AuthSession,
  publicClient?: Client, // TODO(jh): solidify type here. Client, transport, or provider?
): AlchemyAuthEip1193Provider => {
  // TODO(v5): implement any other supported events: https://eips.ethereum.org/EIPS/eip-1193#events
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

        case "eth_signTransaction": {
          return handler<"eth_signTransaction">(async ([transaction]) => {
            if (transaction.type !== "0x2") {
              // TODO(jh): support other txn types.
              throw new InvalidRequestError(
                `Unsupported transaction type: ${transaction.type}. Only EIP-1559 transactions (type 0x2) are supported.`,
              );
            }
            // TODO(jh): track chain within the provider so we can emit events when it changes?
            if (!publicClient?.chain) {
              throw new InvalidRequestError(
                "Cannot sign transaction without a public client with a chain configured.",
              );
            }

            // TODO(jh): extract helper for this?
            const serializableTransaction: TransactionSerializable = {
              ...transaction,
              type: "eip1559",
              chainId: publicClient.chain.id,
              nonce:
                transaction.nonce != null
                  ? Number(transaction.nonce)
                  : undefined,
              value:
                transaction.value != null
                  ? BigInt(transaction.value)
                  : undefined,
              gas:
                transaction.gas != null ? BigInt(transaction.gas) : undefined,
              maxFeePerGas:
                transaction.maxFeePerGas != null
                  ? BigInt(transaction.maxFeePerGas)
                  : undefined,
              maxPriorityFeePerGas:
                transaction.maxPriorityFeePerGas != null
                  ? BigInt(transaction.maxPriorityFeePerGas)
                  : undefined,
              accessList: transaction.accessList,
            };

            const serializedTxn = serializeTransaction(serializableTransaction);
            const digest = keccak256(serializedTxn);

            const sigHex = await authSession.signRawPayload({
              payload: digest,
              mode: "ETHEREUM",
            });

            const { r, s, v } = parseSignature(sigHex);
            const yParity = v === 27n ? 0 : v === 28n ? 1 : Number(v);

            return serializeTransaction(serializableTransaction, {
              r,
              s,
              yParity,
            });
          })(params);
        }

        case "eth_sendTransaction": {
          return handler<"eth_sendTransaction">(async ([transaction]) => {
            if (!publicClient?.chain) {
              throw new InvalidRequestError(
                "Cannot send transaction without a public client for chain.",
              );
            }
            const signed = await request({
              method: "eth_signTransaction",
              params: [transaction],
            });
            return await publicClient.request({
              method: "eth_sendRawTransaction",
              params: [signed],
            });
          })(params);
        }

        case "wallet_sendCalls": {
          return handler<"wallet_sendCalls">(async (params) => {
            if (!publicClient?.chain) {
              throw new InvalidRequestError(
                "Cannot send calls without a public client for chain.",
              );
            }
            if (!params) {
              throw new InvalidRequestError(
                "Missing parameters for wallet_sendCalls",
              );
            }
            const [{ from: _from, calls, chainId: _chainId }] = params;
            const chainId = _chainId ? Number(_chainId) : publicClient.chain.id;
            assertCurrentChain({
              chain: publicClient.chain,
              currentChainId: chainId,
            });
            const from = _from ?? authSession.getAddress();
            if (from.toLowerCase() !== authSession.getAddress().toLowerCase()) {
              throw new InvalidRequestError(
                "Cannot send calls for an address other than the current account.",
              );
            }
            const nonce = await getTransactionCount(publicClient, {
              address: from,
            });
            const txHashes = await Promise.all(
              calls.map(async (call, idx) => {
                const prepared = await prepareTransactionRequest(publicClient, {
                  from,
                  to: call.to,
                  data: call.data,
                  value: call.value ? BigInt(call.value) : undefined,
                  chain: publicClient.chain,
                });
                return request({
                  method: "eth_sendTransaction",
                  params: [
                    formatTransactionRequest({
                      ...prepared,
                      nonce: prepared.nonce ?? nonce + idx,
                    }),
                  ],
                });
              }),
            );
            return {
              // TODO(jh): how to actually format this?
              // we'll need to parse it in getCallsStatus here too.
              id: txHashes.join(Array(32).fill("0").join("")),
            };
          })(params);
        }

        default:
          if (!publicClient) {
            throw new Error(`Unsupported method: ${method}`);
          }
          return publicClient.request({
            method: method as any,
            params: params as any,
          });
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
