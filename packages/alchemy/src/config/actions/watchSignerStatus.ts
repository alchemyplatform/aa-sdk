import { ClientOnlyPropertyError } from "../errors.js";
import type { SignerStatus } from "../store/types.js";
import type { AlchemyAccountsConfig } from "../types";

export const watchSignerStatus =
  (config: AlchemyAccountsConfig) =>
  (onChange: (status: SignerStatus) => void) => {
    if (config.clientStore == null) {
      throw new ClientOnlyPropertyError("signerStatus");
    }

    return config.clientStore.subscribe(
      ({ signerStatus }) => signerStatus,
      onChange,
      { fireImmediately: true }
    );
  };
