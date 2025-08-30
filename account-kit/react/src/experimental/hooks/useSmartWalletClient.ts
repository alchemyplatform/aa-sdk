import {
  getSmartWalletClient,
  watchSmartWalletClient,
} from "@account-kit/core/experimental";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useAccount as wagmi_useAccount } from "wagmi";
import { useAlchemyAccountContext } from "../../hooks/useAlchemyAccountContext.js";
import {
  useSmartAccountClient,
  type UseSmartAccountClientProps,
} from "../../hooks/useSmartAccountClient.js";

// Keeping the same type here for backwards compatibility in aa-sdk v4.
export type UseSmartWalletClientParams = Pick<
  UseSmartAccountClientProps,
  "type" | "accountParams"
>;

/**
 * [Hook](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/experimental/hooks/useSmartWalletClient.ts) that creates a Smart Wallet Client with EIP-5792 wallet_* methods support for cross-app interoperability.
 *
 * This hook extends the Smart Account Client with additional wallet methods that enable interaction with other wallet applications and dApps that support EIP-5792.
 * It provides the same functionality as useSmartAccountClient but with enhanced wallet capabilities for prepared calls and wallet_* methods.
 *
 * If an EOA is connected, this hook will return undefined for the client and show a warning, as Smart Wallet Clients are designed for Smart Contract Accounts.
 *
 * @param {UseSmartWalletClientParams} params The properties required to use the smart wallet client, including optional account parameters, type, and additional client parameters.
 * @returns {{ client: SmartWalletClient | undefined, isLoading: boolean }} An object containing the smart wallet client and loading state.
 *
 * @example
 * ```ts
 * import { useSmartWalletClient } from "@account-kit/react/experimental";
 *
 * const { client, isLoading } = useSmartWalletClient({
 *   accountParams: {
 *     accountAddress: "0x...", // optional
 *   },
 *   type: "ModularAccountV2", // optional, defaults to "ModularAccountV2"
 * });
 * ```
 */
// TODO(jh): move this hook (& others) out of experimental.
export function useSmartWalletClient(params: UseSmartWalletClientParams) {
  const {
    config: {
      _internal: { wagmiConfig },
    },
    config,
  } = useAlchemyAccountContext();

  // The smart account client is used to request an account for the given
  // params, to avoid making our Zustand store's state even more complex.
  const accountClient = useSmartAccountClient(params);

  const account = useMemo(
    () => params.accountParams?.accountAddress ?? accountClient?.address,
    [accountClient?.address, params.accountParams?.accountAddress],
  );

  const smartWalletClient = useSyncExternalStore(
    watchSmartWalletClient(config),
    () => getSmartWalletClient(config, { account }),
    () => getSmartWalletClient(config, { account }),
  );

  const { isConnected } = wagmi_useAccount({
    config: wagmiConfig,
  });

  useEffect(() => {
    if (!isConnected) return;

    console.warn("EOA is connected, will not return an SCA client");
  }, [isConnected]);

  if (isConnected) {
    return {
      client: undefined,
      isLoading: false,
    };
  }

  // TODO(jh): update docs that specify this hook is no longer returning just a `client`
  return {
    client: accountClient.isLoadingClient ? undefined : smartWalletClient,
    isLoading: accountClient.isLoadingClient,
  };
}
