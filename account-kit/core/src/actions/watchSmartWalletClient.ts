import type { AlchemyAccountsConfig } from "../types";
import {
  getSmartWalletClient,
  type GetSmartWalletClientResult,
} from "./getSmartWalletClient.js";

/**
 * Creates a subscription function that watches for changes to the Smart Wallet Client.
 * Triggers the onChange callback whenever the signer status or chain changes.
 *
 * @example
 * ```ts
 * import { watchSmartWalletClient } from "@account-kit/core";
 * // see createConfig for more information on how to create a config
 * import { config } from "./config.js";
 *
 * const watchClient = watchSmartWalletClient(config);
 * const unsubscribe = watchClient((client) => {
 *   console.log("Smart Wallet Client changed:", client);
 * });
 *
 * // Clean up subscription
 * unsubscribe();
 * ```
 *
 * @param {AlchemyAccountsConfig} config The configuration containing the client store and connection information
 * @returns {Function} A function that accepts an onChange callback and returns an unsubscribe function
 */
export function watchSmartWalletClient(config: AlchemyAccountsConfig) {
  return (onChange: (client: GetSmartWalletClientResult) => void) => {
    return config.store.subscribe(
      ({ signerStatus, chain }) => ({ signerStatus, chain }),
      () => {
        onChange(getSmartWalletClient(config));
      },
      {
        equalityFn(a, b) {
          return a.signerStatus === b.signerStatus && a.chain === b.chain;
        },
      },
    );
  };
}
