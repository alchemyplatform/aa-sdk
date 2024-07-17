import type { Chain } from "viem";
import type { AlchemyAccountsConfig } from "../types";

/**
 * Gets the currently active chain
 *
 * @param {AlchemyAccountsConfig} config the account config object
 * @returns {Chain} the currently active chain
 */
export function getChain(config: AlchemyAccountsConfig): Chain {
  return config.store.getState().chain;
}
