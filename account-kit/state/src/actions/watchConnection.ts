import type { AlchemyAccountsConfig, Connection } from "../types";

/**
 * Subscribe to changes to the active connection
 *
 * @param config the account config
 * @returns a function which takes an onChange callback and returns an unsubscribe function
 */
export function watchConnection(config: AlchemyAccountsConfig) {
  return (onChange: (connection: Connection) => void) => {
    return config.coreStore.subscribe(
      ({ chain }) => chain,
      (chain) => {
        const connection = config.coreStore
          .getState()
          .connections.get(chain.id);

        if (connection) {
          onChange(connection);
        }
      }
    );
  };
}
