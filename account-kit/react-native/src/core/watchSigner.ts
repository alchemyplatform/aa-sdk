import type {
  AlchemyAccountsConfig,
  AlchemySigner,
  SignerStatus,
} from "@account-kit/core";

/**
 * Subscribe to changes of the signer instance on the client store.
 *
 * @example
 * ```ts
 * import { watchSigner } from "@account-kit/core";
 * // see createConfig for more information on how to create a config
 * import { config } from "./config";
 *
 * watchSigner(config)(console.log);
 * ```
 *
 * @param {AlchemyAccountsConfig} config the account config containing the client store
 * @returns {(onChange: (chain: AlchemySigner) => void) => (() => void)} a function which accepts an onChange callback that will be fired when the signer changes and returns a function to unsubscribe from the store
 */
export const watchSigner =
  (config: AlchemyAccountsConfig<AlchemySigner>) =>
  (onChange: (signer?: AlchemySigner) => void) => {
    return config.store.subscribe(({ signer }) => signer, onChange);
  };

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
  (config: AlchemyAccountsConfig<AlchemySigner>) =>
  (onChange: (status: SignerStatus) => void) => {
    return config.store.subscribe(
      ({ signerStatus }) => signerStatus,
      onChange,
      {
        equalityFn: (a, b) => a.status === b.status && a.error === b.error,
      }
    );
  };
