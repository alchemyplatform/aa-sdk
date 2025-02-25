import type { AlchemyWebSigner } from "@account-kit/signer";
import {
  createLightAccount,
  createMultiOwnerLightAccount,
  createMultiOwnerModularAccount,
  createModularAccountV2,
  type CreateLightAccountParams,
  type CreateMultiOwnerLightAccountParams,
  type CreateMultiOwnerModularAccountParams,
  type LightAccountVersion,
  type CreateModularAccountV2Params,
} from "@account-kit/smart-contracts";
import { custom, type Transport } from "viem";
import { ClientOnlyPropertyError } from "../errors.js";
import { CoreLogger } from "../metrics.js";
import type {
  AlchemyAccountsConfig,
  SupportedAccountTypes,
  SupportedAccounts,
} from "../types.js";
import { getBundlerClient } from "./getBundlerClient.js";
import { getSigner } from "./getSigner.js";
import { getSignerStatus } from "./getSignerStatus.js";
import type { GetAccountParams } from "./getAccount";

type OmitSignerTransportChain<T> = Omit<T, "signer" | "transport" | "chain">;

export type AccountConfig<TAccount extends SupportedAccountTypes> =
  TAccount extends "LightAccount"
    ? OmitSignerTransportChain<
        CreateLightAccountParams<
          Transport,
          AlchemyWebSigner,
          LightAccountVersion<"LightAccount">
        >
      >
    : TAccount extends "MultiOwnerLightAccount"
    ? OmitSignerTransportChain<
        CreateMultiOwnerLightAccountParams<
          Transport,
          AlchemyWebSigner,
          LightAccountVersion<"MultiOwnerLightAccount">
        >
      >
    : TAccount extends "MultiOwnerModularAccount"
    ? OmitSignerTransportChain<
        CreateMultiOwnerModularAccountParams<Transport, AlchemyWebSigner>
      >
    : TAccount extends "ModularAccountV2"
    ? OmitSignerTransportChain<
        CreateModularAccountV2Params<Transport, AlchemyWebSigner>
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
  config: AlchemyAccountsConfig
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
    throw new Error("Signer not connected");
  }

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
      return createModularAccountV2({
        ...accountConfigs[chain.id]?.[params.type],
        ...params.accountParams,
        signer,
        transport: (opts) => transport({ ...opts, retryCount: 0 }),
        chain,
      }).then((account) => {
        CoreLogger.trackEvent({
          name: "account_initialized",
          data: {
            accountType: "ModularAccountV2",
            accountVersion: "v2.0.0",
          },
        });
        return account;
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

export const isModularV2AccountParams = (
  params: CreateAccountParams<SupportedAccountTypes>
): params is GetAccountParams<"ModularAccountV2"> => {
  return params.type === "ModularAccountV2";
};

export const isLightAccountParams = (
  params: CreateAccountParams<SupportedAccountTypes>
): params is GetAccountParams<"LightAccount"> => {
  return params.type === "LightAccount";
};

export const isMultiOwnerLightAccountParams = (
  params: CreateAccountParams<SupportedAccountTypes>
): params is GetAccountParams<"MultiOwnerLightAccount"> => {
  return params.type === "MultiOwnerLightAccount";
};

export const isMultiOwnerModularAccountParams = (
  params: CreateAccountParams<SupportedAccountTypes>
): params is GetAccountParams<"MultiOwnerModularAccount"> => {
  return params.type === "MultiOwnerModularAccount";
};
