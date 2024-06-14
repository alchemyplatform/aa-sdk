import type { AlchemyAccountsConfig } from "../types";

export const getSignerStatus = (config: AlchemyAccountsConfig) => {
  return config.clientStore.getState().signerStatus;
};
