"use client";

import type { SignerStatus } from "@account-kit/core";
import { getSignerStatus, watchSignerStatus } from "@account-kit/core";
import { useSyncExternalStore } from "react";
import {
  useAlchemyAccountContext,
  type AlchemyAccountContextProps,
} from "../context.js";

export type UseSignerStatusResult = SignerStatus;

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
