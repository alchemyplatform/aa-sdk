"use client";

import { useSyncExternalStore } from "react";
import { getSignerStatus } from "../../config/actions/getSignerStatus.js";
import { watchSignerStatus } from "../../config/actions/watchSignerStatus.js";
import type { SignerStatus } from "../../config/store/types.js";
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
