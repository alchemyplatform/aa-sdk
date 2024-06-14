"use client";

import { getSigner, watchSigner } from "@account-kit/core";
import type { AlchemyWebSigner } from "@account-kit/signer";
import { useSyncExternalStore } from "react";
import { useAlchemyAccountContext } from "../context.js";

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
