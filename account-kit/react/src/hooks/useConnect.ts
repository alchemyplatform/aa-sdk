"use client";

import type { Config } from "@wagmi/core";
import {
  useConnect as wagmi_useConnect,
  type UseConnectParameters,
  type UseConnectReturnType,
} from "wagmi";
import { useAlchemyAccountContext } from "../context.js";
import { ReactLogger } from "../metrics.js";

/**
 * Re-exported wagmi hook for connecting an EOA. This hook
 * uses the internal wagmi config though so that the state
 * is in sync with the rest of the Alchemy Account hook state
 *
 * @param {UseMutationParameters} params mutation parameters to use for the connect mutation
 * @returns {UseConnectReturnType} the wagmi useConnect return type
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
    mutation: {
      ...params,
      onSuccess: (...args) => {
        ReactLogger.trackEvent({
          name: "eoa_connected",
        });
        params?.onSuccess?.(...args);
      },
    },
  });
};
