import { getConnection, watchConnection } from "@account-kit/state";
import { useSyncExternalStore } from "react";
import { useAlchemyAccountContext } from "../context.js";

/**
 * A hook that returns the current connection
 *
 * @returns the current connection
 */
export function useConnection() {
  const { config } = useAlchemyAccountContext();
  return useSyncExternalStore(
    watchConnection(config),
    () => getConnection(config),
    () => getConnection(config)
  );
}
