"use client";

import { useSyncExternalStore } from "react";
import type { ClientWithAlchemyMethods } from "../../client/types.js";
import { watchBundlerClient } from "../../config/actions/watchBundlerClient.js";
import { useAlchemyAccountContext } from "../context.js";

export type UseBundlerClientResult = ClientWithAlchemyMethods;

export const useBundlerClient = () => {
  const { config } = useAlchemyAccountContext();

  return useSyncExternalStore(
    watchBundlerClient(config),
    () => config.bundlerClient,
    () => config.bundlerClient
  );
};
