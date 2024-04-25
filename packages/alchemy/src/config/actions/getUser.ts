import type { AlchemyAccountsConfig } from "../types";

export const getUser = (config: AlchemyAccountsConfig) => {
  return config.clientStore.getState().user;
};
