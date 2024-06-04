import { useSyncExternalStore } from "react";
import { getConnection } from "../../config/actions/getConnection.js";
import { watchConnection } from "../../config/actions/watchConnection.js";
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
