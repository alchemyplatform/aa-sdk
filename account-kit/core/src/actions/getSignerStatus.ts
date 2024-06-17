import type { AlchemyAccountsConfig } from "../types";

/**
 * Retrieves the signer status from the client store using the provided configuration.
 *
 * @param config the Alchemy accounts configuration
 * @returns the current signer status
 */
export const getSignerStatus = (config: AlchemyAccountsConfig) => {
  return config.clientStore.getState().signerStatus;
};
