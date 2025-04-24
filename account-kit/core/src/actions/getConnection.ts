import { ChainNotFoundError } from "../errors.js";
import {
  isViemConnection,
  type AlchemyAccountsConfig,
  type ViemConnection,
} from "../types.js";
import { getChain } from "./getChain.js";

/**
 * Used to get the connection for the currently active chain
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
 * @returns {Connection} a connection object for the current active chain
 */
export function getConnection(config: AlchemyAccountsConfig): ViemConnection {
  const chain = getChain(config);
  const connection = config.store.getState().connections.get(chain.id);
  if (!connection || !isViemConnection(connection)) {
    throw new ChainNotFoundError(chain);
  }

  return connection;
}
