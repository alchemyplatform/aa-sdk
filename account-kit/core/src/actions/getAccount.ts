import { defaultAccountState } from "../store/store.js";
import type { AccountState } from "../store/types.js";
import type { AlchemyAccountsConfig, SupportedAccountTypes } from "../types.js";
import { type CreateAccountParams } from "./createAccount.js";
import { getChain } from "./getChain.js";
import type { CreateModularAccountV2Params } from "@account-kit/smart-contracts";
import type { AccountConfig } from "./createAccount";

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
  { type, accountParams }: GetAccountParams<TAccount>,
  config: AlchemyAccountsConfig
): GetAccountResult<TAccount> => {
  const accounts = config.store.getState().accounts;
  const chain = getChain(config);
  const account = accounts?.[chain.id]?.[type];
  if (!account) {
    return defaultAccountState();
  }

  if (type === "ModularAccountV2" && account?.status === "READY") {
    const accountConfig =
      config.store.getState().accountConfigs[chain.id]?.[type];
    const _accountConfig = accountConfig as
      | AccountConfig<"ModularAccountV2">
      | undefined;
    const _accountParams = accountParams as
      | CreateModularAccountV2Params
      | undefined;

    const haveMode = _accountConfig?.mode ?? "default";
    const wantMode = _accountParams?.mode ?? "default";
    if (haveMode !== wantMode) {
      return defaultAccountState();
    }
  }

  return account;
};
