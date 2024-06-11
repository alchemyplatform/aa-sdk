import type { Chain } from "viem";
import type { AlchemyAccountsConfig } from "../types";

/**
 * Allows you to subscribe to changes of the chain in the client store.
 *
 * @param config the account config object
 * @returns a function which accepts an onChange callback that will be fired when the chain changes
 */
export function watchChain(config: AlchemyAccountsConfig) {
  return (onChange: (chain: Chain) => void) => {
    return config.coreStore.subscribe(({ chain }) => chain, onChange);
  };
}
