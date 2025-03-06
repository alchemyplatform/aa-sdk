import type { SignerStatus } from "../store/types.js";
import type { AlchemyAccountsConfig } from "../types.js";

/**
 * Watches the signer status in the client store and triggers the provided callback function when the status changes.
 *
 * @example
 * ```ts
 * import { watchSignerStatus } from "@account-kit/core";
 * // see createConfig for more information on how to create a config
 * import { config } from "./config";
 *
 * watchSignerStatus(config)(console.log);
 * ```
 *
 * @param {AlchemyAccountsConfig} config The configuration object containing the client store
 * @returns {(onChange: (status: SignerStatus) => void) => (() => void)} A function that accepts a callback to be called when the signer status changes which returns a function to unsubscribe from the store
 */
export const watchSignerStatus =
  (config: AlchemyAccountsConfig) =>
  (onChange: (status: SignerStatus) => void) => {
    return config.store.subscribe(
      ({ signerStatus }) => signerStatus,
      onChange,
      { equalityFn: (a, b) => a.status === b.status && a.error === b.error }
    );
  };
