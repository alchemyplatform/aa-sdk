import type { Config } from "@wagmi/core";
import {
  useConnect as wagmi_useConnect,
  type UseConnectParameters,
  type UseConnectReturnType,
} from "wagmi";
import { useAlchemyAccountContext } from "../context.js";

/**
 * Re-exported wagmi hook for connecting an EOA. This hook
 * uses the internal wagmi config though so that the state
 * is in sync with the rest of the Alchemy Account hook state
 *
 * @param params mutation parameters to use for the connect mutation
 * @returns see {@link UseConnectReturnType} from wagmi
 */
export const useConnect = (
  params?: UseConnectParameters<Config>["mutation"]
): UseConnectReturnType<Config> => {
  const {
    config: {
      _internal: { wagmiConfig },
    },
  } = useAlchemyAccountContext();

  return wagmi_useConnect({
    config: wagmiConfig,
    mutation: params,
  });
};
