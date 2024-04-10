import { ClientOnlyPropertyError } from "../errors.js";
import type { AlchemyAccountsConfig } from "../types";

export const getUser = (config: AlchemyAccountsConfig) => {
  if (config.clientStore == null) {
    throw new ClientOnlyPropertyError("user");
  }

  return config.clientStore.getState().user;
};
