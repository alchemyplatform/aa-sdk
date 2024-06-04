import {
  createLightAccount,
  createMultiOwnerModularAccount,
  type CreateLightAccountParams,
  type CreateMultiOwnerModularAccountParams,
  type GetLightAccountVersion,
} from "@alchemy/aa-accounts";
import { type SmartAccountSigner } from "@alchemy/aa-core";
import { custom, type Transport } from "viem";
import { ClientOnlyPropertyError } from "../errors.js";
import type {
  AlchemyAccountsConfig,
  SupportedAccountTypes,
  SupportedAccounts,
} from "../types";
import { getBundlerClient } from "./getBundlerClient.js";
import { getSigner } from "./getSigner.js";
import { getSignerStatus } from "./getSignerStatus.js";

export type AccountConfig<TAccount extends SupportedAccountTypes> =
  TAccount extends "LightAccount"
    ? Omit<
        CreateLightAccountParams<
          Transport,
          SmartAccountSigner,
          // we only support LightAccount version v1
          Exclude<GetLightAccountVersion<"LightAccount">, "v2.0.0">
        >,
        "signer" | "transport" | "chain"
      >
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
  const accounts = clientStore.getState().accounts;
  if (!accounts) {
    throw new ClientOnlyPropertyError("account");
  }

  const bundlerClient = getBundlerClient(config);
  const transport = custom(bundlerClient);
  const chain = bundlerClient.chain;
  const signer = getSigner(config);
  const signerStatus = getSignerStatus(config);

  if (!signerStatus.isConnected || !signer) {
    throw new Error("Signer not connected");
  }

  const cachedAccount = accounts[chain.id]?.[type];
  if (cachedAccount.status !== "RECONNECTING" && cachedAccount.account) {
    return cachedAccount.account;
  }
  const cachedConfig = clientStore.getState().accountConfigs[chain.id]?.[type];

  const accountPromise = (() => {
    switch (type) {
      case "LightAccount":
        return createLightAccount({
          ...params,
          ...cachedConfig,
          signer,
          transport: (opts) => transport({ ...opts, retryCount: 0 }),
          chain,
        });
      case "MultiOwnerModularAccount":
        return createMultiOwnerModularAccount({
          ...params,
          ...cachedConfig,
          signer,
          transport: (opts) => transport({ ...opts, retryCount: 0 }),
          chain,
        });
      default:
        throw new Error("Unsupported account type");
    }
  })();

  if (cachedAccount.status !== "RECONNECTING") {
    clientStore.setState(() => ({
      accounts: {
        ...accounts,
        [chain.id]: {
          ...accounts[chain.id],
          [type]: {
            status: "INITIALIZING",
            account: accountPromise,
          },
        },
      },
    }));
  }

  try {
    const account = await accountPromise;
    const initCode = await account.getInitCode();
    clientStore.setState((state) => ({
      accounts: {
        ...accounts,
        [chain.id]: {
          ...accounts[chain.id],
          [type]: {
            status: "READY",
            account,
          },
        },
      },
      accountConfigs: {
        ...state.accountConfigs,
        [chain.id]: {
          ...state.accountConfigs[chain.id],
          [type]: {
            ...params,
            accountAddress: account.address,
            initCode,
          },
        },
      },
    }));
  } catch (error) {
    clientStore.setState(() => ({
      accounts: {
        ...accounts,
        [chain.id]: {
          ...accounts[chain.id],
          [type]: {
            status: "ERROR",
            error,
          },
        },
      },
    }));
  }

  return accountPromise;
}
