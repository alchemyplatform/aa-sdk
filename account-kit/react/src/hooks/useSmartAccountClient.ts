"use client";

import type {
  GetAccountParams,
  MultiOwnerLightAccount,
  MultiOwnerLightAccountClientActions,
  SupportedAccount,
  SupportedAccounts,
  SupportedAccountTypes,
} from "@account-kit/core";
import {
  accountLoupeActions,
  createAlchemySmartAccountClientFromExisting,
  lightAccountClientActions,
  multiOwnerLightAccountClientActions,
  multiOwnerPluginActions,
  pluginManagerActions,
  type AccountLoupeActions,
  type AlchemySmartAccountClient,
  type AlchemySmartAccountClientConfig,
  type LightAccount,
  type LightAccountClientActions,
  type MultiOwnerModularAccount,
  type MultiOwnerPluginActions,
  type PluginManagerActions,
} from "@account-kit/core";
import type { AlchemyWebSigner } from "@account-kit/signer";
import { useMemo } from "react";
import type { Address, Chain, Transport } from "viem";
import { useAccount as wagmi_useAccount } from "wagmi";
import { useAlchemyAccountContext } from "../context.js";
import { useAccount } from "./useAccount.js";
import { useBundlerClient } from "./useBundlerClient.js";
import { useConnection } from "./useConnection.js";

export type UseSmartAccountClientProps<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SupportedAccountTypes = SupportedAccountTypes
> = Omit<
  AlchemySmartAccountClientConfig<
    TTransport,
    TChain,
    SupportedAccount<TAccount>
  >,
  "rpcUrl" | "chain" | "apiKey" | "jwt" | "account"
> &
  GetAccountParams<TAccount>;

export type ClientActions<
  TAccount extends SupportedAccounts = SupportedAccounts
> = TAccount extends LightAccount
  ? LightAccountClientActions<AlchemyWebSigner>
  : TAccount extends MultiOwnerModularAccount
  ? MultiOwnerPluginActions<MultiOwnerModularAccount<AlchemyWebSigner>> &
      PluginManagerActions<MultiOwnerModularAccount<AlchemyWebSigner>> &
      AccountLoupeActions<MultiOwnerModularAccount<AlchemyWebSigner>>
  : TAccount extends MultiOwnerLightAccount
  ? MultiOwnerLightAccountClientActions<AlchemyWebSigner>
  : never;

export type UseSmartAccountClientResult<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SupportedAccounts = SupportedAccounts
> = {
  client?: AlchemySmartAccountClient<
    TTransport,
    TChain,
    TAccount,
    ClientActions<TAccount>
  >;
  address?: Address;
  isLoadingClient: boolean;
};

export function useSmartAccountClient<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SupportedAccountTypes = SupportedAccountTypes
>(
  args: UseSmartAccountClientProps<TTransport, TChain, TAccount>
): UseSmartAccountClientResult<TTransport, TChain, SupportedAccount<TAccount>>;

/**
 * Uses the provided smart account client parameters to create or retrieve an existing smart account client, handling different types of accounts including LightAccount, MultiOwnerLightAccount, and MultiOwnerModularAccount.
 *
 * @example
 * ```ts
 * import { useSmartAccountClient } from "@account-kit/react";
 *
 * const { client, address, isLoadingClient } = useSmartAccountClient({
 *  type: "LightAccount",
 *  accountParams: {...}, // optional params to further configure the account
 * });
 * ```
 *
 * @param {UseSmartAccountClientProps} props The properties required to use the smart account client, including account parameters, type, and additional client parameters.
 * @returns {UseSmartAccountClientResult} An object containing the smart account client, the address, and a loading state.
 */
export function useSmartAccountClient({
  accountParams,
  type,
  ...clientParams
}: UseSmartAccountClientProps): UseSmartAccountClientResult {
  const bundlerClient = useBundlerClient();
  const connection = useConnection();

  const {
    config: {
      _internal: { wagmiConfig },
    },
  } = useAlchemyAccountContext();

  const { account, address, isLoadingAccount } = useAccount({
    type,
    accountParams,
  });

  const { isConnected, address: eoaAddress } = wagmi_useAccount({
    config: wagmiConfig,
  });

  const eoaClient = useMemo(() => {
    if (!isConnected) return null;
    console.warn("EOA is connected, will not return an SCA client");

    return {
      client: undefined,
      address: eoaAddress,
      isLoadingClient: false,
    };
  }, [eoaAddress, isConnected]);

  if (eoaClient) {
    return eoaClient;
  }

  if (!account || isLoadingAccount) {
    return {
      client: undefined,
      address,
      isLoadingClient: true,
    };
  }

  switch (account.source) {
    case "LightAccount":
      return {
        client: createAlchemySmartAccountClientFromExisting({
          client: bundlerClient,
          account,
          policyId: connection.policyId,
          ...clientParams,
        }).extend(lightAccountClientActions),
        address: account.address,
        isLoadingClient: false,
      };
    case "MultiOwnerLightAccount":
      return {
        client: createAlchemySmartAccountClientFromExisting({
          client: bundlerClient,
          account,
          policyId: connection.policyId,
          ...clientParams,
        }).extend(multiOwnerLightAccountClientActions),
        address: account.address,
        isLoadingClient: false,
      };
    case "MultiOwnerModularAccount":
      return {
        client: createAlchemySmartAccountClientFromExisting({
          client: bundlerClient,
          account,
          policyId: connection.policyId,
          ...clientParams,
        })
          .extend(multiOwnerPluginActions)
          .extend(pluginManagerActions)
          .extend(accountLoupeActions),
        address: account.address,
        isLoadingClient: false,
      };
    default:
      throw new Error("Unsupported account type");
  }
}
