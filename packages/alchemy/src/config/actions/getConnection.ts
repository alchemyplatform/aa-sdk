import { ChainNotFoundError } from "../errors.js";
import type { AlchemyAccountsConfig, Connection } from "../types";
import { getChain } from "./getChain.js";

/**
 * Used to get the connection for the currently active chain
 *
 * @param config the account config
 * @returns a connection object for the current active chain
 */
export function getConnection(config: AlchemyAccountsConfig): Connection {
  const chain = getChain(config);
  const connection = config.coreStore.getState().connections.get(chain.id);
  if (!connection) {
    throw new ChainNotFoundError(chain);
  }

  return connection;
}
