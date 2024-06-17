import type { ClientWithAlchemyMethods } from "@account-kit/infra";
import type { AlchemyAccountsConfig } from "../types";

/**
 * Retrieves the bundler client from the core store using the provided configuration.
 *
 * @param config the Alchemy accounts configuration
 * @returns the bundler client with Alchemy methods
 */
export const getBundlerClient = (
  config: AlchemyAccountsConfig
): ClientWithAlchemyMethods => {
  return config.coreStore.getState().bundlerClient;
};
