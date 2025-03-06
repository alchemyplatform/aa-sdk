import type { AlchemyAccountsConfig, AlchemySigner } from "../types.js";

/**
 * If there is a signer attached to the client state, it will return it.
 * The signer should always be null on the server, and will be set on the client
 * if the store was properly hydrated.
 *
 * @example
 * ```ts
 * import { getSigner } from "@account-kit/core";
 * import { config } from "./config";
 *
 * const signer = getSigner(config);
 * ```
 *
 * @param {AlchemyAccountsConfig} config The account config which contains the client store
 * @returns {AlchemySigner | null} the instance of the signer present in the store if it exists, otherwise null
 */
export const getSigner = <T extends AlchemySigner>(
  config: AlchemyAccountsConfig
): T | null => {
  const signer: T | null = config.store.getState().signer as T | null;

  return signer;
};
