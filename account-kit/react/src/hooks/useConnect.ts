"use client";

import type { Config } from "@wagmi/core";
import {
  useConnect as wagmi_useConnect,
  type UseConnectParameters,
  type UseConnectReturnType,
} from "wagmi";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";
import { ReactLogger } from "../metrics.js";

/**
 * Re-exported [wagmi hook](https://wagmi.sh/react/api/hooks/useConnect) for connecting an EOA. This hook
 * uses the internal wagmi config though so that the state
 * is in sync with the rest of the Alchemy Account hook state.
 * Useful if you wnat to connect to an EOA.
 *
 * @param {UseMutationParameters} params mutation parameters to use for the connect mutation
 * @returns {UseConnectReturnType} the wagmi useConnect return type
 *
 * @example
 * ```ts twoslash
 * import { useConnect } from "@account-kit/react";
 *
 * const { connectors, connect } = useConnect({
 *  // these are optional
 *  onSuccess: () => {
 *   // do something on success
 *  },
 *  onError: (error) => console.error(error),
 * });
 * ```
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
