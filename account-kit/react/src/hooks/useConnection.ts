"use client";

import {
  getConnection,
  watchConnection,
  type Connection,
} from "@account-kit/core";
import { useSyncExternalStore } from "react";
import { useAlchemyAccountContext } from "../context.js";

/**
 * A hook that returns the current connection
 *
 * @returns {Connection} the current connection
 */
export function useConnection(): Connection {
  const { config } = useAlchemyAccountContext();
  return useSyncExternalStore(
    watchConnection(config),
    () => getConnection(config),
    () => getConnection(config)
  );
}
