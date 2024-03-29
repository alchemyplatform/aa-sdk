"use client";

import { useSyncExternalStore } from "react";
import { getSignerStatus } from "../../config/actions/getSignerStatus.js";
import { watchSignerStatus } from "../../config/actions/watchSignerStatus.js";
import { AlchemySignerStatus } from "../../signer/types.js";
import { useAlchemyAccountContext } from "../context.js";

const serverStatus = {
  status: AlchemySignerStatus.INITIALIZING,
  isInitializing: true,
  isAuthenticating: false,
  isConnected: false,
  isDisconnected: false,
};

export const useSignerStatus = () => {
  const { config } = useAlchemyAccountContext();

  return useSyncExternalStore(
    watchSignerStatus(config),
    () => getSignerStatus(config),
    () => serverStatus
  );
};
