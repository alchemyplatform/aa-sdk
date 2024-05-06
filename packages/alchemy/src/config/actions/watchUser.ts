import type { User } from "../../signer";
import type { AlchemyAccountsConfig } from "../types";

export const watchUser =
  (config: AlchemyAccountsConfig) => (onChange: (user?: User) => void) => {
    return config.clientStore.subscribe(({ user }) => user, onChange, {
      equalityFn: (a, b) => a?.userId === b?.userId,
    });
  };
