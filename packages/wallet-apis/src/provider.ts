import {
  toHex,
  type TypedDataDefinition,
  type Address,
  type WalletRpcSchema,
  ProviderRpcError,
  type Capabilities,
} from "viem";
import {
  AccountNotFoundError,
  BaseError,
  ChainNotFoundError,
  InvalidRequestError,
  createEip1193HandlerFactory,
  type ExtractRpcMethod,
} from "@alchemy/common";
import type {
  SmartWalletClientEip1193Provider,
  SmartWalletClient,
} from "./types.js";
import type { PrepareCallsParams } from "./actions/prepareCalls.js";
import type { WalletServerViemRpcSchema } from "@alchemy/wallet-api-types/rpc";
import EventEmitter from "events"; // TODO(v5): do we need to polyfill this for browser?
import { getCapabilities } from "viem/actions";
import {
  createSmartWalletClientAndRequestAccount,
  type CreateSmartWalletClientParams,
} from "./client.js";
import type { CreationOptions } from "@alchemy/wallet-api-types";

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

const handler = createEip1193HandlerFactory<SmartWalletClient1193Methods>();

/**
 * Creates a  EIP-1193 provider backed by Alchemy's Wallet API, using a wrapped
 * wallet client to sign requests.
 *
 * @param {CreateSmartWalletClientParams<undefined>} clientParams Parameters for creating the provider.
 * @param {CreationOptions | { accountAddress: Address }} accountOptions Options for the created smart wallet account.
 * @returns {SmartWalletClientEip1193Provider} The created provider.
 */
export const createEip1193Provider = (
  clientParams: CreateSmartWalletClientParams<undefined>,
  accountOptions: CreationOptions | { accountAddress: Address } = {},
): SmartWalletClientEip1193Provider => {
  let clientPromise: Promise<SmartWalletClient<Address>> | undefined;

  // TODO(v5): implement any other supported events: https://eips.ethereum.org/EIPS/eip-1193#events
  const eventEmitter = new EventEmitter();

  const request = (async ({ method, params }) => {
    clientPromise ??= (async () => {
      const _client = await createSmartWalletClientAndRequestAccount(
        clientParams,
        accountOptions,
      );
      eventEmitter.emit("connect", { chainId: toHex(_client.chain.id) });
      return _client;
    })();
    const client = await clientPromise;
    try {
      switch (method) {
        case "eth_chainId": {
          return await handler<"eth_chainId">(async () => {
            if (client?.chain.id == null) {
              throw new ChainNotFoundError();
            }
            return toHex(client.chain.id);
          })(params);
        }

        case "eth_accounts": {
          return await handler<"eth_accounts">(async () => {
            if (!client?.account) {
              throw new AccountNotFoundError();
            }
            return [client.account.address];
          })(params);
        }

        case "personal_sign": {
          return await handler<"personal_sign">(async ([data, address]) => {
            if (!client?.account) {
              throw new AccountNotFoundError();
            }
            if (
              address?.toLowerCase() !== client.account.address?.toLowerCase()
            ) {
              throw new InvalidRequestError(
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
          return await handler<"eth_signTypedData_v4">(
            async ([address, tdJson]) => {
              if (!client?.account) {
                throw new AccountNotFoundError();
              }
              if (
                address?.toLowerCase() !== client.account.address.toLowerCase()
              ) {
                throw new InvalidRequestError(
                  "Cannot sign for an address other than the current account.",
                );
              }
              return await client.signTypedData({
                account: client.account.address,
                ...(JSON.parse(tdJson) as TypedDataDefinition),
              });
            },
          )(params);
        }

        // eslint-disable-next-line no-fallthrough
        case "wallet_sendTransaction":
        case "eth_sendTransaction": {
          return await handler<"eth_sendTransaction">(async ([tx]) => {
            if (!client?.account) {
              throw new AccountNotFoundError();
            }
            if (!client.chain) {
              throw new ChainNotFoundError();
            }
            const { to, data, value, from } = tx;
            if (!to) {
              throw new InvalidRequestError("'to' is required.");
            }
            if (from?.toLowerCase() !== client.account.address.toLowerCase()) {
              throw new InvalidRequestError(
                "Cannot use 'from' address other than connected account.",
              );
            }
            const result = await client.sendCalls({
              calls: [{ to, data, value }],
              // TODO(v5): do we need to support any overrides here?
            });
            const callStatusResult = await client.waitForCallsStatus({
              id: result.preparedCallIds[0],
            });
            const txHash = callStatusResult.receipts?.[0]?.transactionHash;
            if (!txHash) {
              throw new InvalidRequestError("Missing transaction hash.");
            }
            return txHash;
          })(params);
        }

        case "wallet_sendCalls": {
          return await handler<"wallet_sendCalls">(async (_params) => {
            if (!_params) {
              throw new InvalidRequestError("Params are required.");
            }
            const [{ calls, capabilities, chainId, from }] = _params;
            if (!client?.account) {
              throw new AccountNotFoundError();
            }
            if (!client.chain) {
              throw new ChainNotFoundError();
            }
            const clientChainId = toHex(client.chain.id);
            if (chainId !== clientChainId) {
              throw new InvalidRequestError(
                `Invalid chain ID (expected ${clientChainId}).`,
              );
            }
            if (calls.some((it) => it.to == null)) {
              throw new InvalidRequestError("'to' is required.");
            }
            if (from?.toLowerCase() !== client.account.address.toLowerCase()) {
              throw new InvalidRequestError(
                "Cannot use 'from' address other than connected account.",
              );
            }

            const result = await client.sendCalls({
              calls: calls.map((c) => ({
                to: c.to!,
                data: c.data,
                value: c.value,
              })),
              capabilities: transformCapabilities(capabilities),
            });
            return {
              id: result.preparedCallIds[0],
            };
          })(params);
        }

        case "wallet_getCapabilities": {
          return await handler<"wallet_getCapabilities">(async () => {
            if (!client?.account) {
              throw new AccountNotFoundError();
            }
            return await getCapabilities(client);
          })(params);
        }

        // TODO(v5): For now, any other methods fall through to the wallet server
        // api. We may want to change this behavior later depending on how we
        // handle request routing within the wagmi connector.
        default:
          return client.request({
            method: method as any,
            params: params as any,
          });
      }
    } catch (err) {
      if (err instanceof ChainNotFoundError) {
        throw new ProviderRpcError(err, {
          code: 4901,
          shortMessage: err.message,
        });
      }
      if (err instanceof AccountNotFoundError) {
        throw new ProviderRpcError(err, {
          code: 4100,
          shortMessage: err.message,
        });
      }
      if (err instanceof InvalidRequestError) {
        throw new ProviderRpcError(err, {
          code: -32600,
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
  }) as SmartWalletClientEip1193Provider["request"];

  return {
    on: eventEmitter.on.bind(eventEmitter),
    removeListener: eventEmitter.removeListener.bind(eventEmitter),
    request,
  };
};

// Wallet server's `paymasterService` type is incompatible with
// Viem's. So we can accept a custom capability property name
// when using an Alchemy paymaster per-call policy id override,
// in order to remain compatible with Viem's `sendCalls` action.
const transformCapabilities = (
  capabilities: Capabilities | undefined,
): PrepareCallsParams["capabilities"] => {
  if (
    "alchemyPaymaster" in (capabilities ?? {}) &&
    !("paymasterService" in (capabilities ?? {})) &&
    capabilities?.alchemyPaymaster.policyId != null
  ) {
    const { alchemyPaymaster, ...rest } = capabilities;
    return {
      ...rest,
      paymasterService: {
        policyId: capabilities.alchemyPaymaster.policyId,
      },
    };
  }
  return capabilities;
};
