import type { Chain } from "viem";
import type { AlchemyAccountsConfig, AlchemySigner } from "../types";

/**
 * Gets the currently active chain
 *
 * @param {AlchemyAccountsConfig} config the account config object
 * @returns {Chain} the currently active chain
 */
export function getChain<T extends AlchemySigner>(
  config: AlchemyAccountsConfig<T>
): Chain {
  return config.store.getState().chain;
}
