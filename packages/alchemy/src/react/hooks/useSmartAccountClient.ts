"use client";

import {
  accountLoupeActions,
  lightAccountClientActions,
  multiOwnerPluginActions,
  pluginManagerActions,
  type AccountLoupeActions,
  type LightAccount,
  type LightAccountClientActions,
  type MultiOwnerModularAccount,
  type MultiOwnerPluginActions,
  type PluginManagerActions,
} from "@alchemy/aa-accounts";
import { useMemo } from "react";
import type { Address, Chain, Transport } from "viem";
import { useAccount as wagmi_useAccount } from "wagmi";
import { createAlchemySmartAccountClientFromRpcClient } from "../../client/internal/smartAccountClientFromRpc.js";
import type {
  AlchemySmartAccountClient,
  AlchemySmartAccountClientConfig,
} from "../../client/smartAccountClient";
import type {
  SupportedAccount,
  SupportedAccountTypes,
  SupportedAccounts,
} from "../../config";
import type { GetAccountParams } from "../../config/actions/getAccount.js";
import type { AlchemySigner } from "../../signer";
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
  ? LightAccountClientActions<AlchemySigner>
  : TAccount extends MultiOwnerModularAccount
  ? MultiOwnerPluginActions<MultiOwnerModularAccount<AlchemySigner>> &
      PluginManagerActions<MultiOwnerModularAccount<AlchemySigner>> &
      AccountLoupeActions<MultiOwnerModularAccount<AlchemySigner>>
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
        client: createAlchemySmartAccountClientFromRpcClient({
          client: bundlerClient,
          account,
          gasManagerConfig: connection.gasManagerConfig,
          ...clientParams,
        }).extend(lightAccountClientActions),
        address: account.address,
        isLoadingClient: false,
      };
    case "MultiOwnerModularAccount":
      return {
        client: createAlchemySmartAccountClientFromRpcClient({
          client: bundlerClient,
          account,
          gasManagerConfig: connection.gasManagerConfig,
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
