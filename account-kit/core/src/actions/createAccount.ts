import {
  createLightAccount,
  createMultiOwnerLightAccount,
  createMultiOwnerModularAccount,
  type CreateLightAccountParams,
  type CreateModularAccountV2Params,
  type CreateMultiOwnerLightAccountParams,
  type CreateMultiOwnerModularAccountParams,
  type LightAccountVersion,
} from "@account-kit/smart-contracts";
import type { SmartWalletClient } from "@account-kit/wallet-client";
import { custom, toHex, type Transport } from "viem";
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
import { getBundlerClient } from "./getBundlerClient.js";
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
  const accountConfigs = store.getState().accountConfigs;

  const bundlerClient = getBundlerClient(config);
  const transport = custom(bundlerClient);
  const chain = bundlerClient.chain;
  const signer = getSigner(config);
  const signerStatus = getSignerStatus(config);

  if (!signerStatus.isConnected || !signer) {
    throw new SignerNotConnectedError();
  }
  const smartWalletClient = getSmartWalletClient(config);

  const cachedAccount = accounts[chain.id]?.[params.type];
  if (cachedAccount.status !== "RECONNECTING" && cachedAccount.account) {
    return cachedAccount.account;
  }

  const accountPromise = (() => {
    if (isLightAccountParams(params)) {
      return createLightAccount({
        ...accountConfigs[chain.id]?.[params.type],
        ...params.accountParams,
        signer,
        transport: (opts) => transport({ ...opts, retryCount: 0 }),
        chain,
      }).then((account) => {
        CoreLogger.trackEvent({
          name: "account_initialized",
          data: {
            accountType: "LightAccount",
            accountVersion: account.getLightAccountVersion(),
          },
        });
        return account;
      });
    } else if (isMultiOwnerLightAccountParams(params)) {
      return createMultiOwnerLightAccount({
        ...accountConfigs[chain.id]?.[params.type],
        ...params.accountParams,
        signer,
        transport: (opts) => transport({ ...opts, retryCount: 0 }),
        chain,
      }).then((account) => {
        CoreLogger.trackEvent({
          name: "account_initialized",
          data: {
            accountType: "MultiOwnerLightAccount",
            accountVersion: account.getLightAccountVersion(),
          },
        });
        return account;
      });
    } else if (isMultiOwnerModularAccountParams(params)) {
      return createMultiOwnerModularAccount({
        ...accountConfigs[chain.id]?.[params.type],
        ...params.accountParams,
        signer,
        transport: (opts) => transport({ ...opts, retryCount: 0 }),
        chain,
      }).then((account) => {
        CoreLogger.trackEvent({
          name: "account_initialized",
          data: {
            accountType: "MultiOwnerModularAccount",
            accountVersion: "v1.0.0",
          },
        });
        return account;
      });
    } else if (isModularV2AccountParams(params)) {
      // TODO: we can probably do away with some of the if-else logic here and just convert the params to creation hints
      // and pass them to the client
      return smartWalletClient
        .requestAccount({
          accountAddress: params.accountParams?.accountAddress,
          creationHint: convertAccountParamsToCreationHint(params),
        })
        .then((account) => {
          CoreLogger.trackEvent({
            name: "account_initialized",
            data: {
              accountType: "ModularAccountV2",
              accountVersion: "v2.0.0",
            },
          });
          return account as SupportedAccounts;
        });
    } else {
      throw new Error(`Unsupported account type: ${params.type}`);
    }
  })();

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
          ...params.accountParams,
          // @ts-expect-error salt is defined by TS can't figure that out here
          salt: toHex(params.accountParams?.salt ?? 0n),
        };
  }

  throw new Error("account not supported yet");
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
