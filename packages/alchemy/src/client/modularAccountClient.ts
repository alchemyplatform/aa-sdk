import {
  accountLoupeActions,
  createMultiOwnerModularAccount,
  multiOwnerPluginActions,
  pluginManagerActions,
  type AccountLoupeActions,
  type CreateMultiOwnerModularAccountParams,
  type MultiOwnerModularAccount,
  type MultiOwnerPluginActions,
  type PluginManagerActions,
} from "@alchemy/aa-accounts";
import type {
  EntryPointDef,
  EntryPointVersion,
  SmartAccountSigner,
} from "@alchemy/aa-core";
import { custom, type Chain, type CustomTransport, type Transport } from "viem";
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
  CreateMultiOwnerModularAccountParams<TEntryPointVersion, Transport, TSigner>,
  "transport" | "chain"
> &
  Omit<
    AlchemySmartAccountClientConfig<
      TEntryPointVersion,
      Transport,
      Chain,
      MultiOwnerModularAccount<TEntryPointVersion, TSigner>
    >,
    "account"
  >;

export function createModularAccountAlchemyClient<
  TAccount extends
    | MultiOwnerModularAccount<TEntryPointVersion, TSigner>
    | undefined,
  TEntryPointVersion extends EntryPointVersion = TAccount extends MultiOwnerModularAccount<
    infer U
  >
    ? U
    : EntryPointVersion,
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
  TAccount extends
    | MultiOwnerModularAccount<TEntryPointVersion, TSigner>
    | undefined,
  TEntryPointVersion extends EntryPointVersion = TAccount extends MultiOwnerModularAccount<
    infer U
  >
    ? U
    : EntryPointVersion,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  config: AlchemyModularAccountClientConfig<TEntryPointVersion, TSigner>
): Promise<
  AlchemySmartAccountClient<
    TEntryPointVersion,
    CustomTransport,
    Chain | undefined,
    MultiOwnerModularAccount<TEntryPointVersion, TSigner>
  >
> {
  const { chain, opts, ...connectionConfig } =
    AlchemyProviderConfigSchema.parse(config);

  const client = createAlchemyPublicRpcClient<TEntryPointVersion>({
    chain,
    connectionConfig,
  });

  const account = (await createMultiOwnerModularAccount<
    EntryPointDef<TEntryPointVersion>
  >({
    transport: custom(client),
    ...config,
  })) as MultiOwnerModularAccount<TEntryPointVersion, TSigner>;

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
