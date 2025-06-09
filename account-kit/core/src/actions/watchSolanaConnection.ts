import type { AlchemyAccountsConfig, SolanaConnection } from "../types";

/**
 * Subscribe to changes to the solana connection for the id
 *
 * @example
 * ```ts twoslash
 * import { watchSolanaConnection } from "@account-kit/core";
 * // see createConfig for more information on how to create a config
 * const config = {} as any;
 *
 * watchSolanaConnection(config)(console.log);
 * ```
 *
 * @param {AlchemyAccountsConfig} config the account config of the connection
 * @returns {(onChange: (connection: Connection) => void) => (() => void)} a function which accepts an onChange callback that will be fired when the connection changes and returns a function to unsubscribe from the store
 */
export function watchSolanaConnection(config: AlchemyAccountsConfig) {
  return (onChange: (connection: SolanaConnection) => void) => {
    return config.store.subscribe(
      ({ chain }) => chain,
      (_) => {
        const connection = config.store.getState().solana;

        if (connection) {
          onChange(connection);
        }
      },
    );
  };
}
