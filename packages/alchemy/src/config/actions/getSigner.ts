import type { AlchemySigner } from "../../signer/signer.js";
import { ClientOnlyPropertyError } from "../errors.js";
import type { AlchemyAccountsConfig } from "../types";

export const getSigner = (config: AlchemyAccountsConfig): AlchemySigner => {
  if (config.clientStore == null) {
    throw new ClientOnlyPropertyError("signer");
  }

  return config.clientStore.getState().signer;
};
