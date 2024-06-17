import type { AccountState } from "../store/types.js";
import type { AlchemyAccountsConfig, SupportedAccountTypes } from "../types.js";
import { type CreateAccountParams } from "./createAccount.js";
import { getChain } from "./getChain.js";

export type GetAccountResult<TAccount extends SupportedAccountTypes> =
  AccountState<TAccount>;

export type GetAccountParams<TAccount extends SupportedAccountTypes> =
  CreateAccountParams<TAccount>;

/**
 * Retrieves an account of the specified type from the client store using the provided configuration.
 *
 * @param param0 the parameters for getting the account
 * @param param0.type the type of account to retrieve
 * @param config the Alchemy accounts configuration
 * @returns the account and its status
 */
export const getAccount = <TAccount extends SupportedAccountTypes>(
  { type }: GetAccountParams<TAccount>,
  config: AlchemyAccountsConfig
): GetAccountResult<TAccount> => {
  const accounts = config.clientStore.getState().accounts;
  const chain = getChain(config);
  const account = accounts?.[chain.id]?.[type];
  if (!account) {
    return {
      account: undefined,
      status: "DISCONNECTED",
    };
  }

  return account;
};
