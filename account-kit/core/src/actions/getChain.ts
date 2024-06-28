import type { Chain } from "viem";
import type { AlchemyAccountsConfig } from "../types";

/**
 * Gets the currently active chain
 *
 * @param config the account config object
 * @returns the currently active chain
 */
export function getChain(config: AlchemyAccountsConfig): Chain {
  return config.coreStore.getState().chain;
}
