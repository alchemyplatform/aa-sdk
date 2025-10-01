import { type ClientWithAlchemyMethods } from "@account-kit/infra";
import type { AlchemyAccountsConfig } from "../types";

/**
 * Retrieves the BundlerClient from the core store of the given AlchemyAccountsConfig.
 *
 * @example
 * ```ts
 * // see `createConfig` for more information on how to create a config
 * import { config } from "./config";
 *
 * const bundlerClient = getBundlerClient(config);
 * ```
 *
 * @param {AlchemyAccountsConfig} config The configuration object containing the core store.
 * @returns {ClientWithAlchemyMethods} The BundlerClient from the core store.
 */
export const getBundlerClient = (
  config: AlchemyAccountsConfig,
): ClientWithAlchemyMethods => {
  const { bundlerClient } = config.store.getState();

  return bundlerClient;
};
