import {
  createAlchemySmartAccountClient,
  type AlchemySmartAccountClient,
  type AlchemySmartAccountClientConfig,
} from "@account-kit/infra";
import {
  accountLoupeActions,
  lightAccountClientActions,
  multiOwnerLightAccountClientActions,
  multiOwnerPluginActions,
  pluginManagerActions,
  type AccountLoupeActions,
  type LightAccount,
  type LightAccountClientActions,
  type MultiOwnerLightAccount,
  type MultiOwnerLightAccountClientActions,
  type MultiOwnerModularAccount,
  type MultiOwnerPluginActions,
  type PluginManagerActions,
  type ModularAccountV2,
} from "@account-kit/smart-contracts";
import type { Address, Chain } from "viem";
import type {
  AlchemyAccountsConfig,
  AlchemySigner,
  SupportedAccount,
  SupportedAccounts,
  SupportedAccountTypes,
  Connection,
} from "../types";
import { createAccount, isModularV2AccountParams } from "./createAccount.js";
import { getAccount, type GetAccountParams } from "./getAccount.js";
import { getAlchemyTransport } from "./getAlchemyTransport.js";
import { getConnection } from "./getConnection.js";
import { getSignerStatus } from "./getSignerStatus.js";
import { default7702GasEstimator, default7702UserOpSigner } from "@aa-sdk/core";

export type GetSmartAccountClientParams<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SupportedAccountTypes = SupportedAccountTypes,
> = Omit<
  AlchemySmartAccountClientConfig<TChain, SupportedAccount<TAccount>>,
  "transport" | "account" | "chain"
> &
  GetAccountParams<TAccount>;

export type ClientActions<
  TAccount extends SupportedAccounts = SupportedAccounts,
> = TAccount extends LightAccount
  ? LightAccountClientActions<AlchemySigner>
  : TAccount extends MultiOwnerModularAccount
    ? MultiOwnerPluginActions<MultiOwnerModularAccount<AlchemySigner>> &
        PluginManagerActions<MultiOwnerModularAccount<AlchemySigner>> &
        AccountLoupeActions<MultiOwnerModularAccount<AlchemySigner>>
    : TAccount extends MultiOwnerLightAccount
      ? MultiOwnerLightAccountClientActions<AlchemySigner>
      : TAccount extends ModularAccountV2
        ? {} // no ma v2 actions
        : never;

export type GetSmartAccountClientResult<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SupportedAccounts = SupportedAccounts,
> = {
  client?: AlchemySmartAccountClient<TChain, TAccount, ClientActions<TAccount>>;
  address?: Address;
  isLoadingClient: boolean;
  error?: Error;
};

export function getSmartAccountClient<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SupportedAccountTypes = SupportedAccountTypes,
>(
  params: GetSmartAccountClientParams<TChain, TAccount>,
  config: AlchemyAccountsConfig,
): GetSmartAccountClientResult<TChain, SupportedAccount<TAccount>>;

/**
 * Obtains a smart account client based on the provided parameters and configuration. Supports creating any of the SupportAccountTypes in Account Kit.
 * If the signer is not connected, or an account is already being intializes, this results in a loading state.
 *
 * @example
 * ```ts
 * import { getSmartAccountClient } from "@account-kit/core";
 * // see createConfig for more information on how to create a config
 * import { config } from "./config";
 *
 * const { client, address, isLoadingClient } = getSmartAccountClient({
 *  type: "LightAccount",
 * }, config);
 * ```
 *
 * @param {GetSmartAccountClientParams} params Parameters for getting the smart account client, including account parameters and client parameters
 * @param {AlchemyAccountsConfig} config The configuration containing the client store and other necessary information
 * @returns {GetSmartAccountClientResult} The result object which includes the client, address, and loading status of the client
 */
export function getSmartAccountClient(
  params: GetSmartAccountClientParams,
  config: AlchemyAccountsConfig,
): GetSmartAccountClientResult {
  const { accountParams, type, ...clientParams } = params;
  const { account, status, error } = getAccount(
    {
      type,
      accountParams,
    },
    config,
  );
  const signerStatus = getSignerStatus(config);
  const transport = getAlchemyTransport(config);
  const connection = getConnection(config);
  const clientState =
    config.store.getState().smartAccountClients[connection.chain.id]?.[type];

  if (status === "ERROR" && clientState?.error) {
    return clientState;
  } else if (status === "ERROR") {
    setSmartAccountClientState({
      config,
      newState: {
        client: undefined,
        address: undefined,
        isLoadingClient: false,
        error,
      },
      type,
      connection,
    });

    return getSmartAccountClientState({
      config,
      chainId: connection.chain.id,
      type,
    });
  }

  if (
    !account ||
    status === "INITIALIZING" ||
    status === "RECONNECTING" ||
    signerStatus.isAuthenticating ||
    signerStatus.isInitializing
  ) {
    if (!account && signerStatus.isConnected) {
      createAccount({ type, accountParams }, config);
    }

    if (clientState && clientState.isLoadingClient) {
      return clientState;
    }

    const loadingState = {
      client: undefined,
      address:
        status === "RECONNECTING" || status === "READY"
          ? account.address
          : undefined,
      isLoadingClient: true,
    };

    setSmartAccountClientState({
      config,
      newState: loadingState,
      type,
      connection,
    });

    return getSmartAccountClientState({
      config,
      chainId: connection.chain.id,
      type,
    });
  }

  // if the state of the client wasn't loading before, then we can just return the cached client
  if (clientState && !clientState.isLoadingClient) {
    return clientState;
  }

  const newState = (() => {
    switch (account.source) {
      case "LightAccount":
        return {
          client: createAlchemySmartAccountClient({
            transport,
            chain: connection.chain,
            account: account,
            policyId: connection.policyId,
            ...clientParams,
          }).extend(lightAccountClientActions),
          address: account.address,
          isLoadingClient: false,
        };
      case "MultiOwnerLightAccount":
        return {
          client: createAlchemySmartAccountClient({
            transport,
            chain: connection.chain,
            account: account,
            policyId: connection.policyId,
            ...clientParams,
          }).extend(multiOwnerLightAccountClientActions),
          address: account.address,
          isLoadingClient: false,
        };
      case "MultiOwnerModularAccount":
        return {
          client: createAlchemySmartAccountClient({
            transport,
            chain: connection.chain,
            account: account,
            policyId: connection.policyId,
            ...clientParams,
          })
            .extend(multiOwnerPluginActions)
            .extend(pluginManagerActions)
            .extend(accountLoupeActions),
          address: account.address,
          isLoadingClient: false,
        };
      case "ModularAccountV2":
        const is7702 =
          isModularV2AccountParams(params) &&
          params.accountParams?.mode === "7702";
        return {
          client: createAlchemySmartAccountClient({
            transport,
            chain: connection.chain,
            account: account,
            policyId: connection.policyId,
            ...(is7702
              ? {
                  gasEstimator: default7702GasEstimator(
                    clientParams.gasEstimator,
                  ),
                  signUserOperation: default7702UserOpSigner(
                    clientParams.signUserOperation,
                  ),
                }
              : {}),
            ...clientParams,
          }),
          address: account.address,
          isLoadingClient: false,
        };
      default:
        assertNeverAccountType(account);
    }
  })();

  setSmartAccountClientState({
    config,
    newState,
    type,
    connection,
  });

  return getSmartAccountClientState({
    config,
    chainId: connection.chain.id,
    type,
  });
}

function getSmartAccountClientState<
  TAccountType extends SupportedAccountTypes,
>({
  config,
  chainId,
  type,
}: {
  chainId: number;
  type: TAccountType;
  config: AlchemyAccountsConfig;
}) {
  return config.store.getState().smartAccountClients[chainId][type]!;
}

function setSmartAccountClientState<
  TAccountType extends SupportedAccountTypes,
>({
  config,
  newState,
  type,
  connection,
}: {
  config: AlchemyAccountsConfig;
  type: TAccountType;
  newState: GetSmartAccountClientResult;
  connection: Connection;
}) {
  config.store.setState((state) => ({
    smartAccountClients: {
      ...state.smartAccountClients,
      [connection.chain.id]: {
        ...state.smartAccountClients[connection.chain.id],
        [type]: newState,
      },
    },
  }));
}

function assertNeverAccountType(_accountType: never): never {
  throw new Error("Unsupported account type");
}
