"use client";

import type { SignerStatus } from "@account-kit/core";
import { getSignerStatus, watchSignerStatus } from "@account-kit/core";
import { useSyncExternalStore } from "react";
import {
  useAlchemyAccountContext,
  type AlchemyAccountContextProps,
} from "../context.js";

export type UseSignerStatusResult = SignerStatus;

/**
 * [Hook](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useSignerStatus.ts) to get the signer status, optionally using an override configuration, useful if you’re building your own login.
 *
 * @param {AlchemyAccountContextProps} [override] optional configuration to override the default context. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/context.tsx#L26)
 * @returns {UseSignerStatusResult} the current state of the signer. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/core/src/store/types.ts#L53)
 *
 * @example
 * ```ts twoslash
 * import { useSignerStatus } from "@account-kit/react";
 *
 * const signerStatus = useSignerStatus();
 * ```
 */
export const useSignerStatus = (
  override?: AlchemyAccountContextProps
): UseSignerStatusResult => {
  const { config } = useAlchemyAccountContext(override);

  return useSyncExternalStore(
    watchSignerStatus(config),
    () => getSignerStatus(config),
    () => getSignerStatus(config)
  );
};
