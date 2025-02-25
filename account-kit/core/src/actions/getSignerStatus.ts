import type { AlchemyAccountsConfig, AlchemySigner } from "../types";

/**
 * Retrieves the signer status from the client's store in the provided configuration.
 *
 * @example
 * ```ts
 * import { getSignerStatus } from "@account-kit/core";
 * // see createConfig for more information on how to create a config
 * import { config } from "./config";
 *
 * const signerStatus = getSignerStatus(config);
 * ```
 *
 * @param {AlchemyAccountsConfig} config The configuration object containing the client store
 * @returns {SignerStatus} The current signer status from the client store
 */
export const getSignerStatus = <T extends AlchemySigner>(
  config: AlchemyAccountsConfig<T>
) => {
  return config.store.getState().signerStatus;
};
