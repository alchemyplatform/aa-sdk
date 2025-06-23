import {
  type CreateLightAccountParams,
  type CreateModularAccountV2Params,
  type CreateMultiOwnerLightAccountParams,
  type CreateMultiOwnerModularAccountParams,
  type LightAccountVersion,
} from "@account-kit/smart-contracts";
import type { SmartWalletClient } from "@account-kit/wallet-client";
import { toHex, type Transport } from "viem";
import { ClientOnlyPropertyError, SignerNotConnectedError } from "../errors.js";
import { getSmartWalletClient } from "../experimental/actions/getSmartWalletClient.js";
import { CoreLogger } from "../metrics.js";
import type {
  AlchemyAccountsConfig,
  AlchemySigner,
  SupportedAccountTypes,
  SupportedAccounts,
} from "../types.js";
import type { GetAccountParams } from "./getAccount";
import { getConnection } from "./getConnection.js";
import { getSigner } from "./getSigner.js";
import { getSignerStatus } from "./getSignerStatus.js";

type OmitSignerTransportChain<T> = Omit<T, "signer" | "transport" | "chain">;

export type AccountConfig<TAccount extends SupportedAccountTypes> =
  TAccount extends "LightAccount"
    ? OmitSignerTransportChain<
        CreateLightAccountParams<
          Transport,
          AlchemySigner,
          LightAccountVersion<"LightAccount">
        >
      >
    : TAccount extends "MultiOwnerLightAccount"
      ? OmitSignerTransportChain<
          CreateMultiOwnerLightAccountParams<
            Transport,
            AlchemySigner,
            LightAccountVersion<"MultiOwnerLightAccount">
          >
        >
      : TAccount extends "MultiOwnerModularAccount"
        ? OmitSignerTransportChain<
            CreateMultiOwnerModularAccountParams<Transport, AlchemySigner>
          >
        : TAccount extends "ModularAccountV2"
          ? OmitSignerTransportChain<
              CreateModularAccountV2Params<Transport, AlchemySigner>
            >
          : never;

export type CreateAccountParams<TAccount extends SupportedAccountTypes> = {
  type: TAccount;
  accountParams?: AccountConfig<TAccount>;
};

/**
 * Creates an account of a specified type using the provided parameters and configuration. Supports creating LightAccount and MultiOwnerModularAccount types.
 *
 * @example
 * ```ts
 * import { createAccount } from "@account-kit/core";
 * // see createConfig for more information on how to create a config
 * import { config } from "./config";
 *
 * const account = createAccount({
 *  type: "LightAccount",
 * }, config);
 * ```
 *
 * @param {CreateAccountParams<TAccount>} params The parameters required to create the account, including the type and account parameters
 * @param {AlchemyAccountsConfig} config The configuration object for Alchemy accounts
 * @returns {Promise<SupportedAccounts>} A promise that resolves to the created account object
 */
export async function createAccount<TAccount extends SupportedAccountTypes>(
  params: CreateAccountParams<TAccount>,
  config: AlchemyAccountsConfig,
): Promise<SupportedAccounts> {
  const store = config.store;
  const accounts = store.getState().accounts;
  if (!accounts) {
    throw new ClientOnlyPropertyError("account");
  }

  const connection = getConnection(config);
  const chain = connection.chain;
  const signer = getSigner(config);
  const signerStatus = getSignerStatus(config);

  if (!signerStatus.isConnected || !signer) {
    throw new SignerNotConnectedError();
  }
  const smartWalletClient = getSmartWalletClient(config);
  if (!smartWalletClient) {
    throw new Error("Smart wallet client not found");
  }

  const cachedAccount = accounts[chain.id]?.[params.type];
  if (cachedAccount.status !== "RECONNECTING" && cachedAccount.account) {
    return cachedAccount.account;
  }

  const accountPromise = smartWalletClient
    .requestAccount({
      accountAddress: params.accountParams?.accountAddress,
      creationHint: convertAccountParamsToCreationHint(params),
    })
    .then((account) => {
      CoreLogger.trackEvent({
        name: "account_initialized",
        data: {
          accountType: params.type,
          accountVersion: isLightAccountParams(params)
            ? (params.accountParams?.version ?? "v2.0.0")
            : isMultiOwnerLightAccountParams(params)
              ? "v2.0.0"
              : isMultiOwnerModularAccountParams(params)
                ? "v1.0.0"
                : "v2.0.0",
        },
      });
      return account as SupportedAccounts;
    });

  if (cachedAccount.status !== "RECONNECTING") {
    store.setState((state) => ({
      accounts: {
        ...accounts,
        [chain.id]: {
          ...accounts[chain.id],
          [params.type]: {
            status: "INITIALIZING",
            account: accountPromise,
          },
        },
      },
      accountConfigs: {
        ...state.accountConfigs,
        [chain.id]: {
          ...state.accountConfigs[chain.id],
          [params.type]: {
            ...params.accountParams,
          },
        },
      },
    }));
  }

  try {
    const account = await accountPromise;
    const initCode = await account.getInitCode();
    store.setState((state) => ({
      accounts: {
        ...accounts,
        [chain.id]: {
          ...accounts[chain.id],
          [params.type]: {
            status: "READY",
            account,
          },
        },
      },
      accountConfigs: {
        ...state.accountConfigs,
        [chain.id]: {
          ...state.accountConfigs[chain.id],
          [params.type]: {
            ...params.accountParams,
            accountAddress: account.address,
            initCode,
          },
        },
      },
    }));
  } catch (error) {
    store.setState(() => ({
      accounts: {
        ...accounts,
        [chain.id]: {
          ...accounts[chain.id],
          [params.type]: {
            status: "ERROR",
            error,
          },
        },
      },
    }));
  }

  return accountPromise;
}

function convertAccountParamsToCreationHint<
  TAccount extends SupportedAccountTypes,
>(
  params: CreateAccountParams<TAccount>,
): NonNullable<
  Parameters<SmartWalletClient["requestAccount"]>["0"]
>["creationHint"] {
  if (isModularV2AccountParams(params)) {
    return params.accountParams?.mode === "7702"
      ? { accountType: "7702" }
      : {
          accountType: "sma-b",
          // @ts-expect-error salt is defined by TS can't figure that out here
          salt: toHex(params.accountParams?.salt ?? 0n),
        };
  }
  if (isLightAccountParams(params)) {
    return {
      accountType: `la-${params.accountParams?.version === "v2.0.0" ? "v2" : (params.accountParams?.version ?? "v2")}`,
      salt: toHex(params.accountParams?.salt ?? 0n),
    };
  }

  if (isMultiOwnerLightAccountParams(params)) {
    return {
      accountType: `la-v2-multi-owner`,
      salt: toHex(params.accountParams?.salt ?? 0n),
      initialOwners: params.accountParams?.owners,
    };
  }

  if (isMultiOwnerModularAccountParams(params)) {
    return {
      accountType: "ma-v1-multi-owner",
      salt: toHex(params.accountParams?.salt ?? 0n),
      initialOwners: params.accountParams?.owners,
    };
  }

  throw new Error(`account of type ${params.type} not supported yet`);
}

export const isModularV2AccountParams = (
  params: CreateAccountParams<SupportedAccountTypes>,
): params is GetAccountParams<"ModularAccountV2"> => {
  return params.type === "ModularAccountV2";
};

export const isLightAccountParams = (
  params: CreateAccountParams<SupportedAccountTypes>,
): params is GetAccountParams<"LightAccount"> => {
  return params.type === "LightAccount";
};

export const isMultiOwnerLightAccountParams = (
  params: CreateAccountParams<SupportedAccountTypes>,
): params is GetAccountParams<"MultiOwnerLightAccount"> => {
  return params.type === "MultiOwnerLightAccount";
};

export const isMultiOwnerModularAccountParams = (
  params: CreateAccountParams<SupportedAccountTypes>,
): params is GetAccountParams<"MultiOwnerModularAccount"> => {
  return params.type === "MultiOwnerModularAccount";
};
