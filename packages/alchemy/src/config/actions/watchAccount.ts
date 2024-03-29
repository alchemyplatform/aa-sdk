import { ClientOnlyPropertyError } from "../errors.js";
import type { AlchemyAccountsConfig, SupportedAccountTypes } from "../types";
import type { GetAccountResult } from "./getAccount";

export const watchAccount =
  <TAccount extends SupportedAccountTypes>(
    type: TAccount,
    config: AlchemyAccountsConfig
  ) =>
  (onChange: (account: GetAccountResult<TAccount>) => void) => {
    if (config.clientStore == null) {
      throw new ClientOnlyPropertyError("account");
    }

    return config.clientStore.subscribe(
      ({ accounts }) => accounts[type],
      onChange,
      {
        fireImmediately: true,
        equalityFn(a, b) {
          return (
            (a?.status === "READY" &&
              b?.status === "READY" &&
              a.account.address === b.account.address) ||
            a?.status === b?.status
          );
        },
      }
    );
  };
