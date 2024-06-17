import type { SignerStatus } from "../store/types.js";
import type { AlchemyAccountsConfig } from "../types.js";

/**
 * Watches the signer status and calls the provided callback on changes.
 *
 * @param config the Alchemy accounts configuration
 * @returns a function that subscribes to signer status changes and calls the provided callback
 */
export const watchSignerStatus =
  (config: AlchemyAccountsConfig) =>
  (onChange: (status: SignerStatus) => void) => {
    return config.clientStore.subscribe(
      ({ signerStatus }) => signerStatus,
      onChange,
      { equalityFn: (a, b) => a.status === b.status }
    );
  };
