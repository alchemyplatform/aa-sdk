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
 * Hook to get the signer status, optionally using an override configuration.
 *
 * @example
 * ```ts
 * import { useSignerStatus } from "@account-kit/react";
 *
 * const signerStatus = useSignerStatus();
 * ```
 *
 * @param {AlchemyAccountContextProps} [override] optional configuration to override the default context
 * @returns {UseSignerStatusResult} the current state of the signer
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
