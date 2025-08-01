import {
  getSmartWalletClient,
  watchSmartWalletClient,
  type GetSmartWalletClientParams,
} from "@account-kit/core/experimental";
import { useEffect, useSyncExternalStore } from "react";
import type { Address } from "viem";
import { useAccount as wagmi_useAccount } from "wagmi";
import { useAlchemyAccountContext } from "../../hooks/useAlchemyAccountContext.js";

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
