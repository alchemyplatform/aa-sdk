"use client";

import { getSigner, watchSigner } from "@account-kit/core";
import type { AlchemyWebSigner } from "@account-kit/signer";
import { useSyncExternalStore } from "react";
import { useAlchemyAccountContext } from "../context.js";

/**
 * [Hook](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useSigner.ts) for accessing the current Alchemy signer within a React component. It uses a synchronous external store for updates.
 * This is a good use case if you want to use the signer as an EOA, giving you direct access to it.
 *
 * @example
 * ```ts
 * import { useSigner } from "@account-kit/react";
 *
 * const signer = useSigner();
 * ```
 *
 * @returns {AlchemyWebSigner | null} The current Alchemy signer or null if none is available. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/signer/src/client/index.ts#L50)
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
