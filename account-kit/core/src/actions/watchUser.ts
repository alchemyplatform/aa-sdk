import type { User } from "@account-kit/signer";
import type { AlchemyAccountsConfig } from "../types";

/**
 * Watches the user and calls the provided callback on changes.
 *
 * @param config the Alchemy accounts configuration
 * @returns a function that subscribes to user changes and calls the provided callback
 */
export const watchUser =
  (config: AlchemyAccountsConfig) => (onChange: (user?: User) => void) => {
    return config.clientStore.subscribe(({ user }) => user, onChange, {
      equalityFn: (a, b) => a?.userId === b?.userId,
    });
  };
