import type { AlchemyAccountsConfig, AlchemySigner } from "../types";

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
  (config: AlchemyAccountsConfig) =>
  (onChange: (signer?: AlchemySigner) => void) => {
    return config.store.subscribe(({ signer }) => signer, onChange);
  };
