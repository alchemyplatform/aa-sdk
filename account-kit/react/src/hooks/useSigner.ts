"use client";

import { getSigner, watchSigner, type AlchemySigner } from "@account-kit/core";
import { useSyncExternalStore } from "react";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";
import type { AlchemyAccountContextProps } from "../AlchemyAccountContext.js";

/**
 * [Hook](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useSigner.ts) for accessing the current Alchemy signer within a React component. It uses a synchronous external store for updates.
 * This is a good use case if you want to use the signer as an EOA, giving you direct access to it. The signer returned from `useSigner` just does a `personal_sign` or `eth_signTypedData` without any additional logic, but a smart contract account might have additional logic for creating signatures for 1271 validation so `useSignMessage` or `useSignTypeData` instead.
 *
 * @param {AlchemyAccountContextProps} [override] optional configuration to override the default context. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/context.tsx#L26)
 * @returns {AlchemySigner | null} The current Alchemy signer or null if none is available. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/signer/src/client/index.ts#L50)
 *
 * @example
 * ```ts twoslash
 * import { useSigner } from "@account-kit/react";
 * import type { AlchemyWebSigner } from "@account-kit/signer";
 *
 * const signer : AlchemyWebSigner | null = useSigner();
 * ```
 */
export const useSigner = <T extends AlchemySigner>(
  override?: AlchemyAccountContextProps
): T | null => {
  const { config } = useAlchemyAccountContext(override);

  // TODO: figure out how to handle this on the server
  // I think we need a version of the signer that can be run on the server that essentially no-ops or errors
  // for all calls
  return useSyncExternalStore(
    watchSigner(config),
    () => getSigner<T>(config),
    () => null
  );
};
