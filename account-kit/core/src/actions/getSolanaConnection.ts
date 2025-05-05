import { type AlchemyAccountsConfig, type SolanaConnection } from "../types.js";

/**
 * Used to get the connection for the id
 *
 * @example
 * ```ts
 * import { getSolanaConnection } from "@account-kit/core";
 * import { config } from "./config";
 *
 * const connection = getSolanaConnection(config);
 * ```
 *
 * @param {AlchemyAccountsConfig} config the account config
 * @returns {SolanaConnection | void} a connection object for the current active chain
 */
export function getSolanaConnection(
  config: AlchemyAccountsConfig
): SolanaConnection | null {
  const connection = config.store.getState().solana;
  if (!connection) {
    return null;
  }

  return connection;
}
