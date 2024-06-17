import type { ClientWithAlchemyMethods } from "@account-kit/infra";
import type { AlchemyAccountsConfig } from "../types";

/**
 * Watches the bundler client and calls the provided callback on changes.
 *
 * @param config the Alchemy accounts configuration
 * @returns a function that subscribes to bundler client changes and calls the provided callback
 */
export const watchBundlerClient =
  (config: AlchemyAccountsConfig) =>
  (onChange: (bundlerClient: ClientWithAlchemyMethods) => void) => {
    return config.coreStore.subscribe(
      ({ bundlerClient }) => bundlerClient,
      onChange
    );
  };
