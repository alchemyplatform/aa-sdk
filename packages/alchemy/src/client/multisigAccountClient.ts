import {
  accountLoupeActions,
  createMultisigModularAccount,
  multisigPluginActions,
  multisigSignatureMiddleware,
  pluginManagerActions,
  type AccountLoupeActions,
  type CreateMultisigModularAccountParams,
  type LightAccount,
  type MultisigModularAccount,
  type MultisigPluginActions,
  type MultisigUserOperationContext,
  type PluginManagerActions,
} from "@alchemy/aa-accounts";
import {
  smartAccountClientActions,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
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
} from "./smartAccountClient";

// todo: this file seems somewhat duplicated with ./modularAccountClient.ts, but that file has some multi-owner specific fields. Is there a way to refactor these two to de-dupe?

export type AlchemyMultisigAccountClientConfig<
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Omit<
  CreateMultisigModularAccountParams<HttpTransport, TSigner>,
  "transport" | "chain"
> &
  Omit<
    AlchemySmartAccountClientConfig<
      Transport,
      Chain,
      LightAccount<TSigner>,
      MultisigUserOperationContext
    >,
    "account"
  >;

export function createMultisigAccountAlchemyClient<
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  params: AlchemyMultisigAccountClientConfig<TSigner>
): Promise<
  AlchemySmartAccountClient<
    CustomTransport,
    Chain | undefined,
    MultisigModularAccount<TSigner>,
    MultisigPluginActions<MultisigModularAccount<TSigner>> &
      PluginManagerActions<MultisigModularAccount<TSigner>> &
      AccountLoupeActions<MultisigModularAccount<TSigner>>,
    MultisigUserOperationContext
  >
>;

export async function createMultisigAccountAlchemyClient(
  config: AlchemyMultisigAccountClientConfig
): Promise<
  AlchemySmartAccountClient<
    Transport,
    Chain | undefined,
    MultisigModularAccount<SmartAccountSigner>,
    MultisigPluginActions<MultisigModularAccount<SmartAccountSigner>> &
      PluginManagerActions<MultisigModularAccount<SmartAccountSigner>> &
      AccountLoupeActions<MultisigModularAccount<SmartAccountSigner>>,
    MultisigUserOperationContext
  >
> {
  const { chain, opts, ...connectionConfig } =
    AlchemyProviderConfigSchema.parse(config);

  const client = createAlchemyPublicRpcClient({
    chain,
    connectionConfig,
  });

  const account = await createMultisigModularAccount({
    transport: custom(client),
    ...config,
  });

  return createAlchemySmartAccountClientFromRpcClient<
    Chain | undefined,
    MultisigModularAccount<SmartAccountSigner>,
    MultisigUserOperationContext
  >({
    ...config,
    client,
    account,
    opts,
    signUserOperation: multisigSignatureMiddleware,
  })
    .extend(smartAccountClientActions)
    .extend(multisigPluginActions)
    .extend(pluginManagerActions)
    .extend(accountLoupeActions);
}
