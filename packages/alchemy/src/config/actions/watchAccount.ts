import { ClientOnlyPropertyError } from "../errors.js";
import type { AlchemyAccountsConfig, SupportedAccountTypes } from "../types";
import type { GetAccountResult } from "./getAccount";

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

    return config.clientStore.subscribe(
      // this should be available on the client now because of the check above
      ({ accounts }) => accounts![type],
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
