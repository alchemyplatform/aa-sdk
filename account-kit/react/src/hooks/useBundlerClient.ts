"use client";

import { getBundlerClient, watchBundlerClient } from "@account-kit/core";
import type { ClientWithAlchemyMethods } from "@account-kit/infra";
import { useSyncExternalStore } from "react";
import { useAlchemyAccountContext } from "../context.js";

export type UseBundlerClientResult = ClientWithAlchemyMethods;

/**
 * Custom hook to get a bundler client using the Alchemy account context.
 * It uses `useSyncExternalStore` to watch for any changes in the bundler client configuration and provides the updated bundler client.
 *
 * @example
 * ```ts
 * import { useBundlerClient } from "@account-kit/react";
 *
 * const bundlerClient = useBundlerClient();
 * ```
 *
 * @returns {BundlerClient} The bundler client based on the current Alchemy account configuration
 */
export const useBundlerClient = () => {
  const { config } = useAlchemyAccountContext();

  return useSyncExternalStore(
    watchBundlerClient(config),
    () => getBundlerClient(config),
    () => getBundlerClient(config)
  );
};
