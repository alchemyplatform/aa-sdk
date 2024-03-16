import {
  accountLoupeActions,
  createMultiOwnerModularAccount,
  multiOwnerPluginActions,
  pluginManagerActions,
  type AccountLoupeActions,
  type CreateMultiOwnerModularAccountParams,
  type LightAccount,
  type MultiOwnerModularAccount,
  type MultiOwnerPluginActions,
  type PluginManagerActions,
} from "@alchemy/aa-accounts";
import type { EntryPointVersion, SmartAccountSigner } from "@alchemy/aa-core";
import {
  custom,
  type Chain,
  type CustomTransport,
  type HttpTransport,
  type Transport,
} from "viem";
import { AlchemyProviderConfigSchema } from "../schema.js";
import { createAlchemySmartAccountClientFromRpcClient } from "./internal/smartAccountClientFromRpc.js";
import { createAlchemyPublicRpcClient } from "./rpcClient.js";
import type {
  AlchemySmartAccountClient,
  AlchemySmartAccountClientConfig,
  BaseAlchemyActions,
} from "./smartAccountClient";

export type AlchemyModularAccountClientConfig<
  TEntryPointVersion extends EntryPointVersion,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Omit<
  CreateMultiOwnerModularAccountParams<
    TEntryPointVersion,
    HttpTransport,
    TSigner
  >,
  "transport" | "chain"
> &
  Omit<
    AlchemySmartAccountClientConfig<
      TEntryPointVersion,
      Transport,
      Chain,
      LightAccount<TEntryPointVersion, TSigner>
    >,
    "account"
  >;

export function createModularAccountAlchemyClient<
  TEntryPointVersion extends EntryPointVersion,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  params: AlchemyModularAccountClientConfig<TEntryPointVersion, TSigner>
): Promise<
  AlchemySmartAccountClient<
    TEntryPointVersion,
    CustomTransport,
    Chain | undefined,
    MultiOwnerModularAccount<TEntryPointVersion, TSigner>,
    BaseAlchemyActions<
      TEntryPointVersion,
      Chain | undefined,
      MultiOwnerModularAccount<TEntryPointVersion, TSigner>
    > &
      MultiOwnerPluginActions<
        TEntryPointVersion,
        MultiOwnerModularAccount<TEntryPointVersion, TSigner>
      > &
      PluginManagerActions<
        TEntryPointVersion,
        MultiOwnerModularAccount<TEntryPointVersion, TSigner>
      > &
      AccountLoupeActions<
        TEntryPointVersion,
        MultiOwnerModularAccount<TEntryPointVersion, TSigner>
      >
  >
>;

export async function createModularAccountAlchemyClient<
  TEntryPointVersion extends EntryPointVersion
>(
  config: AlchemyModularAccountClientConfig<TEntryPointVersion>
): Promise<AlchemySmartAccountClient<TEntryPointVersion>> {
  const { chain, opts, ...connectionConfig } =
    AlchemyProviderConfigSchema.parse(config);

  const client = createAlchemyPublicRpcClient<TEntryPointVersion>({
    chain,
    connectionConfig,
  });

  const account = await createMultiOwnerModularAccount({
    transport: custom(client),
    ...config,
  });

  return createAlchemySmartAccountClientFromRpcClient({
    ...config,
    client,
    account,
    opts,
  })
    .extend(multiOwnerPluginActions)
    .extend(pluginManagerActions)
    .extend(accountLoupeActions);
}
