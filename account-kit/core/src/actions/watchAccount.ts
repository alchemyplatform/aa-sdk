import { ClientOnlyPropertyError } from "../errors.js";
import type { AlchemyAccountsConfig, SupportedAccountTypes } from "../types.js";
import { type GetAccountResult } from "./getAccount.js";
import { getChain } from "./getChain.js";

/**
 * Watches an account of the specified type and calls the provided callback on changes.
 *
 * @param type the type of account to watch
 * @param config the Alchemy accounts configuration
 * @returns a function that subscribes to account changes and calls the provided callback
 */
export const watchAccount =
  <TAccount extends SupportedAccountTypes>(
    type: TAccount,
    config: AlchemyAccountsConfig
  ) =>
  (onChange: (account: GetAccountResult<TAccount>) => void) => {
    const accounts = config.clientStore.getState().accounts;
    if (!accounts) {
      throw new ClientOnlyPropertyError("account");
    }

    const chain = getChain(config);
    return config.clientStore.subscribe(
      // this should be available on the client now because of the check above
      ({ accounts }) => accounts![chain.id][type],
      onChange,
      {
        equalityFn(a, b) {
          return a?.status === "READY" && b?.status === "READY"
            ? a.account.address === b.account.address
            : a?.status === b?.status;
        },
      }
    );
  };
