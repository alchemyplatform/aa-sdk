"use client";

import { useSyncExternalStore } from "react";
import { watchBundlerClient } from "../../config/actions/watchBundlerClient.js";
import { useAlchemyAccountContext } from "../context.js";

export const useBundlerClient = () => {
  const { config } = useAlchemyAccountContext();

  return useSyncExternalStore(
    watchBundlerClient(config),
    () => config.bundlerClient,
    () => config.bundlerClient
  );
};
