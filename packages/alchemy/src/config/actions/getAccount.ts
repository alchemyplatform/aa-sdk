import { ClientOnlyPropertyError } from "../errors.js";
import type { AccountState } from "../store/types.js";
import type { AlchemyAccountsConfig, SupportedAccountTypes } from "../types";
import { type CreateAccountParams } from "./createAccount.js";

export type GetAccountResult<TAccount extends SupportedAccountTypes> =
  AccountState<TAccount>;

export type GetAccountParams<TAccount extends SupportedAccountTypes> =
  CreateAccountParams<TAccount>;

export const getAccount = <TAccount extends SupportedAccountTypes>(
  { type }: GetAccountParams<TAccount>,
  config: AlchemyAccountsConfig
): GetAccountResult<TAccount> => {
  const clientStore = config.clientStore;
  if (!clientStore) {
    throw new ClientOnlyPropertyError("account");
  }

  return clientStore.getState().accounts[type];
};
