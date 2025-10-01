"use client";

import {
  getConnection,
  watchConnection,
  type Connection,
} from "@account-kit/core";
import { useSyncExternalStore } from "react";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";

/**
 * A [hook](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useConnection.ts) that returns the current connection including chain, policy, and transport that you’re currently using.
 *
 * @returns {Connection} the current connection. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/core/src/types.ts#L56)
 */
export function useConnection(): Connection {
  const { config } = useAlchemyAccountContext();
  return useSyncExternalStore(
    watchConnection(config),
    () => getConnection(config),
    () => getConnection(config),
  );
}
