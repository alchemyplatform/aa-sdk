import { defaultAccountState } from "../store/store.js";
import type { AccountState } from "../store/types.js";
import type { AlchemyAccountsConfig, SupportedAccountTypes } from "../types.js";
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
  console.log("getAccount");
  const accounts = config.store.getState().accounts;
  const accountConfigs = config.store.getState().accountConfigs;
  const chain = getChain(config);
  const account = accounts?.[chain.id]?.[params.type];

  // If MAv2 mode changed, remove the account from the store
  // so it can be re-initialized with the correct mode.
  if (
    account &&
    account?.status === "READY" &&
    params.type === "ModularAccountV2"
  ) {
    const { accountParams } = params as GetAccountParams<"ModularAccountV2">;
    const wantMode = accountParams?.mode ?? "default";

    const accountConfig = accountConfigs[chain.id]?.["ModularAccountV2"];
    const haveMode = accountConfig?.mode;

    if (wantMode !== haveMode) {
      config.store.setState((state) => ({
        ...state,
        accounts: {
          ...accounts,
          [chain.id]: {
            ...accounts[chain.id],
            ModularAccountV2: defaultAccountState(),
          },
        },
        accountConfigs: {
          ...accountConfigs,
          [chain.id]: {
            ...accountConfigs[chain.id],
            ModularAccountV2: {},
          },
        },
      }));
      return defaultAccountState();
    }
  }

  if (!account) {
    return defaultAccountState();
  }

  return account;
};
