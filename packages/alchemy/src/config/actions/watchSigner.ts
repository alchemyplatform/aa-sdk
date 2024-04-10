import type { AlchemySigner } from "../../signer";
import { ClientOnlyPropertyError } from "../errors.js";
import type { AlchemyAccountsConfig } from "../types";

export const watchSigner =
  (config: AlchemyAccountsConfig) =>
  (onChange: (signer: AlchemySigner) => void) => {
    if (config.clientStore == null) {
      throw new ClientOnlyPropertyError("signer");
    }

    return config.clientStore.subscribe(({ signer }) => signer, onChange, {
      fireImmediately: true,
    });
  };
