import { ClientOnlyPropertyError } from "../errors.js";
import type { AlchemyAccountsConfig, SupportedAccountTypes } from "../types.js";
import { type GetAccountResult } from "./getAccount.js";
import { getChain } from "./getChain.js";

/**
 * Watches for changes to a specific type of account and triggers the provided callback function when changes occur.
 *
 * @example
 * ```ts
 * import { watchAccount } from "@account-kit/core";
 * // see createConfig for more information on how to create a config
 * import { config } from "./config";
 *
 * watchAccount("LightAccount", config)(console.log);
 * ```
 *
 * @template TAccount The type of account to watch
 * @param {TAccount} type The type of account to watch
 * @param {AlchemyAccountsConfig} config The configuration containing client store settings
 * @returns {(onChange: (account: GetAccountResult<TAccount>) => void) => (() => void)} A function that accepts a callback to be called when the account changes and returns a function to unsubscribe from the store
 */
export const watchAccount =
  <TAccount extends SupportedAccountTypes>(
    type: TAccount,
    config: AlchemyAccountsConfig,
  ) =>
  (onChange: (account: GetAccountResult<TAccount>) => void) => {
    const accounts = config.store.getState().accounts;
    if (!accounts) {
      throw new ClientOnlyPropertyError("account");
    }

    const chain = getChain(config);
    return config.store.subscribe(
      // this should be available on the client now because of the check above
      ({ accounts }) => accounts![chain.id][type],
      onChange,
      {
        equalityFn(a, b) {
          return a?.status === "READY" && b?.status === "READY"
            ? a.account.address === b.account.address
            : a?.status === b?.status;
        },
      },
    );
  };
