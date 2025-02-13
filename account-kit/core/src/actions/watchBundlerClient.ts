import { type ClientWithAlchemyMethods } from "@account-kit/infra";
import type { AlchemyAccountsConfig } from "../types";

/**
 * Watches for changes to the bundler client within the given configuration and triggers a callback when changes occur.
 *
 * @example
 * ```ts
 * import { watchBundlerClient } from "@account-kit/core";
 * // see createConfig for more information on how to create a config
 * import { config } from "./config";
 *
 * watchBundlerClient(config)(console.log);
 * ```
 *
 * @param {AlchemyAccountsConfig} config The configuration object containing the core store
 * @returns {(onChange: (bundlerClient: ClientWithAlchemyMethods) => void) => (() => void)} A function accepting a callback function to invoke when the bundler client changes and returns a function to unsubscribe from the store
 */
export const watchBundlerClient =
  (config: AlchemyAccountsConfig) =>
  (onChange: (bundlerClient: ClientWithAlchemyMethods) => void) => {
    return config.store.subscribe(
      ({ bundlerClient }) => bundlerClient,
      onChange,
      {
        equalityFn(a, b) {
          return a.chain.id === b.chain.id;
        },
      }
    );
  };
