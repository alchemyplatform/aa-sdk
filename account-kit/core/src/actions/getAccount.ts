import type { AccountState } from "../store/types.js";
import type { AlchemyAccountsConfig, SupportedAccountTypes } from "../types.js";
import { parseMode } from "../utils/parser.js";
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
  params: GetAccountParams<TAccount>,
  config: AlchemyAccountsConfig
): GetAccountResult<TAccount> => {
  const { type, accountParams } = params;
  const mode = parseMode(type, accountParams);

  const accounts = config.store.getState().accounts;
  const chain = getChain(config);
  const account =
    params.type === "ModularAccountV2"
      ? accounts?.[chain.id]?.["ModularAccountV2"]?.[mode]
      : accounts?.[chain.id]?.[type];

  if (!account) {
    return {
      account: undefined,
      status: "DISCONNECTED",
    };
  }

  return account as GetAccountResult<TAccount>;
};
