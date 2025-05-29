import {
  getSmartWalletClient,
  watchSmartWalletClient,
  type GetSmartWalletClientParams,
} from "@account-kit/core/experimental";
import { useMemo, useSyncExternalStore } from "react";
import { useAccount as wagmi_useAccount } from "wagmi";
import { useAlchemyAccountContext } from "../../hooks/useAlchemyAccountContext.js";

export function useSmartWalletClient(params: GetSmartWalletClientParams) {
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

  const eoaClient = useMemo(() => {
    if (!isConnected) return null;
    console.warn("EOA is connected, will not return an SCA client");

    return undefined;
  }, [isConnected]);

  if (eoaClient) {
    return eoaClient;
  }

  return result;
}
