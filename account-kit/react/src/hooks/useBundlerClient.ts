"use client";

import type { ClientWithAlchemyMethods } from "@account-kit/core";
import { getBundlerClient, watchBundlerClient } from "@account-kit/state";
import { useSyncExternalStore } from "react";
import { useAlchemyAccountContext } from "../context.js";

export type UseBundlerClientResult = ClientWithAlchemyMethods;

export const useBundlerClient = () => {
  const { config } = useAlchemyAccountContext();

  return useSyncExternalStore(
    watchBundlerClient(config),
    () => getBundlerClient(config),
    () => getBundlerClient(config)
  );
};
