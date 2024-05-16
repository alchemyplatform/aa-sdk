import type { Config } from "@wagmi/core";
import {
  useConnect as wagmi_useConnect,
  type UseConnectReturnType,
} from "wagmi";
import { useAlchemyAccountContext } from "../context.js";

/**
 * Re-exported wagmi hook for connecting an EOA. This hook
 * uses the internal wagmi config though so that the state
 * is in sync with the rest of the Alchemy Account hook state
 *
 * @returns see {@link UseConnectReturnType} from wagmi
 */
export const useConnect = (): UseConnectReturnType<Config> => {
  const {
    config: {
      _internal: { wagmiConfig },
    },
  } = useAlchemyAccountContext();

  return wagmi_useConnect({ config: wagmiConfig });
};
