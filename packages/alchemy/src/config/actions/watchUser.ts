import type { User } from "../../signer";
import { ClientOnlyPropertyError } from "../errors.js";
import type { AlchemyAccountsConfig } from "../types";

export const watchUser =
  (config: AlchemyAccountsConfig) => (onChange: (user?: User) => void) => {
    if (config.clientStore == null) {
      throw new ClientOnlyPropertyError("user");
    }

    return config.clientStore.subscribe(({ user }) => user, onChange, {
      fireImmediately: true,
    });
  };
