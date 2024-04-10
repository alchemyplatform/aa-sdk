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
import type { Chain, Transport } from "viem";
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
import { useAccount } from "./useAccount.js";
import { useBundlerClient } from "./useBundlerClient.js";

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
  const { account, isLoadingAccount } = useAccount({
    type,
    accountParams,
  });

  if (!account || isLoadingAccount) {
    return { client: undefined, isLoadingClient: true };
  }

  switch (account.source) {
    case "LightAccount":
      return {
        client: createAlchemySmartAccountClientFromRpcClient({
          client: bundlerClient,
          account,
          ...clientParams,
        }).extend(lightAccountClientActions),
        isLoadingClient: false,
      };
    case "MultiOwnerModularAccount":
      return {
        client: createAlchemySmartAccountClientFromRpcClient({
          client: bundlerClient,
          account,
          ...clientParams,
        })
          .extend(multiOwnerPluginActions)
          .extend(pluginManagerActions)
          .extend(accountLoupeActions),
        isLoadingClient: false,
      };
    default:
      throw new Error("Unsupported account type");
  }
}
