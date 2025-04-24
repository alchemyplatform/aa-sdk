import type { AlchemyAccountsConfig, Connection } from "../types";

/**
 * Subscribe to changes to the solana connection for the id
 *
 * @example
 * ```ts
 * import { watchSolanaConnection } from "@account-kit/core";
 * // see createConfig for more information on how to create a config
 * import { config } from "./config";
 *
 * watchSolanaConnection(config, SOLANA_DEVNET_CHAIN_SYMBOL)(console.log);
 * ```
 *
 * @param {AlchemyAccountsConfig} config the account config
 * @param {string} id the id of the connection
 * @returns {(onChange: (connection: Connection) => void) => (() => void)} a function which accepts an onChange callback that will be fired when the connection changes and returns a function to unsubscribe from the store
 */
export function watchSolanaConnection(
  config: AlchemyAccountsConfig,
  id: string
) {
  return (onChange: (connection: Connection) => void) => {
    return config.store.subscribe(
      ({ chain }) => chain,
      (_) => {
        const connection = config.store.getState().connections.get(id);

        if (connection) {
          onChange(connection);
        }
      }
    );
  };
}
