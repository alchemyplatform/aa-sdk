import { ClientOnlyPropertyError } from "../errors.js";
import type { AlchemyAccountsConfig } from "../types";

export const getSignerStatus = (config: AlchemyAccountsConfig) => {
  if (config.clientStore == null) {
    throw new ClientOnlyPropertyError("signerStatus");
  }

  return config.clientStore.getState().signerStatus;
};
