import type { AlchemyWebSigner } from "@account-kit/signer";
import {
  createLightAccount,
  createMultiOwnerLightAccount,
  createMultiOwnerModularAccount,
  type CreateLightAccountParams,
  type CreateMultiOwnerLightAccountParams,
  type CreateMultiOwnerModularAccountParams,
  type LightAccountVersion,
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

export type AccountConfig<TAccount extends SupportedAccountTypes> =
  TAccount extends "LightAccount"
    ? Omit<
        CreateLightAccountParams<
          Transport,
          AlchemyWebSigner,
          LightAccountVersion<"LightAccount">
        >,
        "signer" | "transport" | "chain"
      >
    : TAccount extends "MultiOwnerLightAccount"
    ? Omit<
        CreateMultiOwnerLightAccountParams<
          Transport,
          AlchemyWebSigner,
          LightAccountVersion<"MultiOwnerLightAccount">
        >,
        "signer" | "transport" | "chain"
      >
    : Omit<
        CreateMultiOwnerModularAccountParams<Transport, AlchemyWebSigner>,
        "signer" | "transport" | "chain"
      >;

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
  { type, accountParams: params }: CreateAccountParams<TAccount>,
  config: AlchemyAccountsConfig
): Promise<SupportedAccounts> {
  const store = config.store;
  const accounts = store.getState().accounts;
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
  const cachedConfig = store.getState().accountConfigs[chain.id]?.[type];

  const accountPromise = (() => {
    switch (type) {
      case "LightAccount":
        return createLightAccount({
          ...params,
          ...cachedConfig,
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
      case "MultiOwnerLightAccount":
        return createMultiOwnerLightAccount({
          ...(params as AccountConfig<"MultiOwnerLightAccount">),
          ...(cachedConfig as Omit<
            CreateMultiOwnerLightAccountParams,
            "transport" | "chain" | "signer"
          >),
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
      case "MultiOwnerModularAccount":
        return createMultiOwnerModularAccount({
          ...(params as AccountConfig<"MultiOwnerModularAccount">),
          ...(cachedConfig as Omit<
            CreateMultiOwnerModularAccountParams,
            "transport" | "chain" | "signer"
          >),
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
      default:
        throw new Error("Unsupported account type");
    }
  })();

  if (cachedAccount.status !== "RECONNECTING") {
    store.setState(() => ({
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
    store.setState((state) => ({
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
    store.setState(() => ({
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
