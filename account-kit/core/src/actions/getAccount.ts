import type { AccountState } from "../store/types.js";
import type { AlchemyAccountsConfig, SupportedAccountTypes } from "../types.js";
import {
  type AccountConfig,
  type CreateAccountParams,
} from "./createAccount.js";
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
  const accounts = config.store.getState().accounts;
  const accountConfigs = config.store.getState().accountConfigs;
  const chain = getChain(config);
  const account = accounts?.[chain.id]?.[type];
  if (!account) {
    return {
      account: undefined,
      status: "DISCONNECTED",
    };
  }

  if (params.type === "ModularAccountV2") {
    const accountConfig = accountConfigs?.[chain.id]?.["ModularAccountV2"];
    const wantMode = (
      params.accountParams as AccountConfig<"ModularAccountV2"> | undefined
    )?.mode;
    const haveMode = accountConfig?.mode;

    console.log(
      "getAccount",
      { want: { type, accountParams } },
      { got: { account, accountConfig } }
    );

    if (haveMode !== wantMode && account.status === "READY") {
      // Wipe the MAv2 account state from the store since the mode has changed.
      // This seems to work fine, but the UI does a weird flash from too many re-renders.
      // TODO(jh): Is that preventable? Or should we do something else entirely?
      const {
        accounts: initialAccounts,
        accountConfigs: initialAccountConfigs,
      } = config.store.getInitialState();
      config.store.setState((state) => ({
        ...state,
        accounts: initialAccounts,
        accountConfigs: Object.fromEntries(
          Object.entries(initialAccountConfigs).map(([chain, configs]) => [
            chain,
            Object.fromEntries(
              Object.entries(configs).map(([t, c]) => [
                t,
                {
                  ...c,
                  ...(t === "ModularAccountV2"
                    ? { ...c, mode: wantMode }
                    : { ...c }),
                },
              ])
            ),
          ])
        ),
      }));
      return {
        account: undefined,
        status: "DISCONNECTED",
      };
    }
  }

  return account;
};
