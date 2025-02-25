import type { AccountState } from "../store/types.js";
import type {
  AlchemyAccountsConfig,
  AlchemySigner,
  SupportedAccountTypes,
} from "../types.js";
import { type CreateAccountParams } from "./createAccount.js";
import { getChain } from "./getChain.js";

export type GetAccountResult<TAccount extends SupportedAccountTypes> =
  AccountState<TAccount>;

export type GetAccountParams<TAccount extends SupportedAccountTypes> =
  CreateAccountParams<TAccount>;

/**
 * Retrieves the account of the specified type from the client store based on the provided configuration.
 *
 * @example
 * ```ts
 * import { getAccount } from "@account-kit/core";
 * // see createConfig for more information on how to create a config
 * import { config } from "./config";
 *
 * const { account, status } = getAccount({
 *  type: "LightAccount"
 * }, config)
 * ```
 *
 * @param {GetAccountParams<TAccount>} params The parameters containing the type of the account to retrieve
 * @param {AlchemyAccountsConfig} config The configuration containing the client store
 * @returns {GetAccountResult<TAccount>} The result which includes the account if found and its status
 */
export const getAccount = <TAccount extends SupportedAccountTypes>(
  { type }: GetAccountParams<TAccount>,
  config: AlchemyAccountsConfig<AlchemySigner>
): GetAccountResult<TAccount> => {
  const accounts = config.store.getState().accounts;
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
