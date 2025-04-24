import {
  isWeb3Connection,
  type AlchemyAccountsConfig,
  type Web3Connection,
} from "../types.js";

/**
 * Used to get the connection for the id
 *
 * @example
 * ```ts
 * import { getConnection } from "@account-kit/core";
 * import { config } from "./config";
 *
 * const connection = getConnection(config);
 * ```
 *
 * @param {AlchemyAccountsConfig} config the account config
 * @param {string} id the id of the connection
 * @returns {Web3Connection | void} a connection object for the current active chain
 */
export function getSolanaConnection(
  config: AlchemyAccountsConfig,
  id: string
): Web3Connection | void {
  const connection = config.store.getState().connections.get(id);
  if (!connection || !isWeb3Connection(connection)) {
    return;
  }

  return connection;
}
