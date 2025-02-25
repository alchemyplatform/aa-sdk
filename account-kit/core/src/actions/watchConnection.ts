import type {
  AlchemyAccountsConfig,
  AlchemySigner,
  Connection,
} from "../types";

/**
 * Subscribe to changes to the active connection
 *
 * @example
 * ```ts
 * import { watchConnection } from "@account-kit/core";
 * // see createConfig for more information on how to create a config
 * import { config } from "./config";
 *
 * watchConnection(config)(console.log);
 * ```
 *
 * @param {AlchemyAccountsConfig} config the account config
 * @returns {(onChange: (connection: Connection) => void) => (() => void)} a function which accepts an onChange callback that will be fired when the connection changes and returns a function to unsubscribe from the store
 */
export function watchConnection(config: AlchemyAccountsConfig<AlchemySigner>) {
  return (onChange: (connection: Connection) => void) => {
    return config.store.subscribe(
      ({ chain }) => chain,
      (chain) => {
        const connection = config.store.getState().connections.get(chain.id);

        if (connection) {
          onChange(connection);
        }
      }
    );
  };
}
