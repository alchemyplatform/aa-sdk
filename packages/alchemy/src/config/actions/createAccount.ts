import {
  createLightAccount,
  createMultiOwnerModularAccount,
  type CreateLightAccountParams,
  type CreateMultiOwnerModularAccountParams,
} from "@alchemy/aa-accounts";
import { getEntryPoint } from "@alchemy/aa-core";
import { custom } from "viem";
import { ClientOnlyPropertyError } from "../errors.js";
import type {
  AlchemyAccountsConfig,
  SupportedAccountTypes,
  SupportedAccounts,
} from "../types";
import { getSignerStatus } from "./getSignerStatus.js";

export type AccountConfig<TAccount extends SupportedAccountTypes> =
  TAccount extends "LightAccount"
    ? Omit<CreateLightAccountParams, "signer" | "transport" | "chain">
    : Omit<
        CreateMultiOwnerModularAccountParams,
        "signer" | "transport" | "chain"
      >;

export type CreateAccountParams<TAccount extends SupportedAccountTypes> = {
  type: TAccount;
  accountParams?: AccountConfig<TAccount>;
};

export async function createAccount<TAccount extends SupportedAccountTypes>(
  { type, accountParams: params }: CreateAccountParams<TAccount>,
  config: AlchemyAccountsConfig
): Promise<SupportedAccounts> {
  const clientStore = config.clientStore;
  if (!clientStore) {
    throw new ClientOnlyPropertyError("account");
  }

  const transport = custom(config.bundlerClient);
  const chain = config.bundlerClient.chain;
  const signer = config.signer;
  const signerStatus = getSignerStatus(config);

  if (!signerStatus.isConnected) {
    throw new Error("Signer not connected");
  }

  const cachedAccount = clientStore.getState().accounts[type];
  if (cachedAccount?.account) {
    return cachedAccount.account;
  }

  const accountPromise = (() => {
    switch (type) {
      case "LightAccount":
        return createLightAccount({
          ...params,
          signer,
          transport: (opts) => transport({ ...opts, retryCount: 0 }),
          chain,
        });
      case "MultiOwnerModularAccount":
        return createMultiOwnerModularAccount({
          ...params,
          signer,
          transport: (opts) => transport({ ...opts, retryCount: 0 }),
          chain,
          entryPoint: getEntryPoint(chain),
        });
      default:
        throw new Error("Unsupported account type");
    }
  })();

  clientStore.setState((state) => ({
    accounts: {
      ...state.accounts,
      [type]: {
        status: "INITIALIZING",
        account: accountPromise,
      },
    },
  }));

  try {
    const account = await accountPromise;
    clientStore.setState((state) => ({
      accounts: {
        ...state.accounts,
        [type]: {
          status: "READY",
          account,
        },
      },
    }));
  } catch (error) {
    clientStore.setState((state) => ({
      accounts: {
        ...state.accounts,
        [type]: {
          status: "ERROR",
          error,
        },
      },
    }));
  }

  return accountPromise;
}
