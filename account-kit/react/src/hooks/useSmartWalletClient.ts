"use client";

import {
  getSmartWalletClient,
  watchSmartWalletClient,
  type GetSmartWalletClientParams,
} from "@account-kit/core";
import { useEffect, useSyncExternalStore } from "react";
import type { Address } from "viem";
import { useAccount as wagmi_useAccount } from "wagmi";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";

/**
 * React hook that provides a Smart Wallet Client instance.
 * Returns undefined if an EOA wallet is connected via wagmi, as Smart Wallet Clients are only for smart accounts.
 * The hook automatically subscribes to changes in signer status and chain configuration.
 *
 * @example
 * ```tsx
 * import { useSmartWalletClient } from "@account-kit/react";
 *
 * function MyComponent() {
 *   const client = useSmartWalletClient();
 *
 *   // With specific account address
 *   const clientWithAccount = useSmartWalletClient({
 *     account: "0x1234..."
 *   });
 *
 *   if (client) {
 *     // Use the client for wallet operations
 *     console.log("Smart Wallet Client ready:", client);
 *   }
 *
 *   return <div>...</div>;
 * }
 * ```
 *
 * @param {GetSmartWalletClientParams<TAccount>} params Parameters for getting the smart wallet client, including optional account address
 * @returns {GetSmartWalletClientResult<TAccount>} The Smart Wallet Client instance or undefined if an EOA is connected or client is unavailable
 */
export function useSmartWalletClient<
  TAccount extends Address | undefined = Address | undefined,
>(params: GetSmartWalletClientParams<TAccount>) {
  const {
    config: {
      _internal: { wagmiConfig },
    },
    config,
  } = useAlchemyAccountContext();

  const result = useSyncExternalStore(
    watchSmartWalletClient(config),
    () => getSmartWalletClient(config, params),
    () => getSmartWalletClient(config, params),
  );

  const { isConnected } = wagmi_useAccount({
    config: wagmiConfig,
  });

  useEffect(() => {
    if (!isConnected) return;

    console.warn("EOA is connected, will not return an SCA client");
  }, [isConnected]);

  if (isConnected) {
    return undefined;
  }

  return result;
}
