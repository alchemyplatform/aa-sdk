import {
  createSmartWalletClient,
  type SmartWalletClient,
} from "@account-kit/wallet-client";
import type { Address } from "viem";
import { getAlchemyTransport } from "./getAlchemyTransport.js";
import { getConnection } from "./getConnection.js";
import { getSigner } from "./getSigner.js";
import { getSignerStatus } from "./getSignerStatus.js";
import type { AlchemyAccountsConfig } from "../types.js";

export type GetSmartWalletClientResult<
  TAccount extends Address | undefined = Address | undefined,
> = SmartWalletClient<TAccount> | undefined;

export type GetSmartWalletClientParams<
  TAccount extends Address | undefined = Address | undefined,
> = { account?: TAccount };

export function getSmartWalletClient<
  TAccount extends Address | undefined = Address | undefined,
>(
  config: AlchemyAccountsConfig,
  params?: GetSmartWalletClientParams<TAccount>,
): GetSmartWalletClientResult<TAccount>;

/**
 * Creates and returns a Smart Wallet Client instance.
 * Returns undefined if running in a server environment or if no signer is connected.
 * Caches clients by chain ID & address for performance optimization.
 *
 * @example
 * ```ts
 * import { getSmartWalletClient } from "@account-kit/core";
 * // see createConfig for more information on how to create a config
 * import { config } from "./config.js";
 *
 * const client = getSmartWalletClient(config);
 *
 * // With specific account address
 * const clientWithAccount = getSmartWalletClient(config, {
 *   account: "0x1234..."
 * });
 * ```
 *
 * @param {AlchemyAccountsConfig} config The configuration containing the client store and connection information
 * @param {GetSmartWalletClientParams} [params] Optional parameters including account address
 * @returns {GetSmartWalletClientResult} The Smart Wallet Client instance or undefined if not available
 */
export function getSmartWalletClient(
  config: AlchemyAccountsConfig,
  params?: GetSmartWalletClientParams,
): GetSmartWalletClientResult {
  if (typeof window === "undefined") {
    return undefined;
  }

  const connection = getConnection(config);
  const signerStatus = getSignerStatus(config);
  const transport = getAlchemyTransport(config);
  const signer = getSigner(config);

  if (!signer || !signerStatus.isConnected) {
    return undefined;
  }

  const isAccountClientLoading = Array.from(
    Object.values(
      config.store.getState().smartAccountClients[connection.chain.id] || {},
    ),
  ).some((it) => it.isLoadingClient);

  // Hooks that use `useSmartWalletClient` internally are passed a SmartAccountClient
  // as a param. While the client is loading, it's expected that its account address
  // will be undefined. However, it's possible that consuming apps may use the
  // `useSmartWalletClient` hook directly and specify the account address while
  // the SmartAccountClient is still loading. To prevent this from resulting in an
  // infinite render loop, we can wait until the SmartAccountClient is done loading
  // before using the account address from params.
  const account = isAccountClientLoading ? undefined : params?.account;

  const smartWalletClient =
    config.store.getState().smartWalletClients[connection.chain.id];

  if (smartWalletClient && smartWalletClient.account?.address === account) {
    return smartWalletClient;
  }

  const client = createSmartWalletClient({
    transport,
    chain: connection.chain,
    signer,
    account,
    ...(Array.isArray(connection.policyId)
      ? { policyIds: connection.policyId }
      : connection.policyId
        ? { policyId: connection.policyId }
        : {}),
  });

  config.store.setState((state) => ({
    smartWalletClients: {
      ...state.smartWalletClients,
      [connection.chain.id]: client,
    },
  }));

  return client;
}
