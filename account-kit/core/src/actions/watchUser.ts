import type { User } from "@account-kit/signer";
import type { AlchemyAccountsConfig, AlchemySigner } from "../types";

/**
 * Watches for changes to the user in the client store and triggers the provided callback when a change is detected.
 *
 * @example
 * ```ts
 * import { watchUser } from "@account-kit/core";
 * // see createConfig for more information on how to create a config
 * import { config } from "./config";
 *
 * watchUser(config)(console.log);
 * ```
 *
 * @param {AlchemyAccountsConfig} config the configuration containing the client store
 * @returns {(onChange: (user: User) => void) => (() => void)} a function which accepts a callback that fires when the user changes and returns a function to unsubscribe from the user updates
 */
export const watchUser =
  (config: AlchemyAccountsConfig<AlchemySigner>) =>
  (onChange: (user?: User) => void) => {
    return config.store.subscribe(({ user }) => user, onChange, {
      equalityFn: (a, b) => a?.userId === b?.userId,
    });
  };
