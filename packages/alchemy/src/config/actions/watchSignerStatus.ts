import type { SignerStatus } from "../store/types.js";
import type { AlchemyAccountsConfig } from "../types";

export const watchSignerStatus =
  (config: AlchemyAccountsConfig) =>
  (onChange: (status: SignerStatus) => void) => {
    return config.clientStore.subscribe(
      ({ signerStatus }) => signerStatus,
      onChange,
      { equalityFn: (a, b) => a.status === b.status }
    );
  };
