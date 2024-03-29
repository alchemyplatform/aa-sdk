"use client";

import { useSyncExternalStore } from "react";
import { watchSigner } from "../../config/actions/watchSigner.js";
import { useAlchemyAccountContext } from "../context.js";

export const useSigner = () => {
  const { config } = useAlchemyAccountContext();

  // TODO: figure out how to handle this on the server
  // I think we need a version of the signer that can be run on the server that essentially no-ops or errors
  // for all calls
  return useSyncExternalStore(
    watchSigner(config),
    () => config.signer,
    // We don't want to return null here, should return something of type AlchemySigner
    () => null
  );
};
