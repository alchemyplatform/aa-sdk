"use client";

import { getSigner, watchSigner } from "@account-kit/core";
import type { AlchemyWebSigner } from "@account-kit/signer";
import { useSyncExternalStore } from "react";
import { useAlchemyAccountContext } from "../context.js";

/**
 * Hook for accessing the current Alchemy signer within a React component. It uses a synchronous external store for updates.
 *
 * @example
 * ```ts
 * import { useSigner } from "@account-kit/react";
 *
 * const signer = useSigner();
 * ```
 *
 * @returns {AlchemyWebSigner | null} The current Alchemy signer or null if none is available
 */
export const useSigner = (): AlchemyWebSigner | null => {
  const { config } = useAlchemyAccountContext();

  // TODO: figure out how to handle this on the server
  // I think we need a version of the signer that can be run on the server that essentially no-ops or errors
  // for all calls
  return useSyncExternalStore(
    watchSigner(config),
    () => getSigner(config),
    // We don't want to return null here, should return something of type AlchemySigner
    () => null
  );
};
