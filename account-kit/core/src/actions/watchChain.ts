import type { Chain } from "viem";
import type { AlchemyAccountsConfig } from "../types";

/**
 * Allows you to subscribe to changes of the chain in the client store.
 *
 * @example
 * ```ts
 * import { watchChain } from "@account-kit/core";
 * // see createConfig for more information on how to create a config
 * import { config } from "./config";
 *
 * watchChain(config)(console.log);
 * ```
 *
 * @param {AlchemyAccountsConfig} config the account config object
 * @returns {(onChange: (chain: Chain) => void) => (() => void)} a function which accepts an onChange callback that will be fired when the chain changes and returns a function to unsubscribe from the store
 */
export function watchChain(config: AlchemyAccountsConfig) {
  return (onChange: (chain: Chain) => void) => {
    return config.store.subscribe(({ chain }) => chain, onChange);
  };
}
