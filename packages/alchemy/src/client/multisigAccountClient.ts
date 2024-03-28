import {
  accountLoupeActions,
  createMultisigModularAccount,
  multisigPluginActions,
  multisigSignatureMiddleware,
  pluginManagerActions,
  type AccountLoupeActions,
  type CreateMultisigModularAccountParams,
  type LightAccount,
  type MultiOwnerPluginActions,
  type MultisigModularAccount,
  type MultisigUserOperationContext,
  type PluginManagerActions,
} from "@alchemy/aa-accounts";
import type { SmartAccountSigner } from "@alchemy/aa-core";
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
    BaseAlchemyActions<Chain | undefined, MultisigModularAccount<TSigner>> &
      MultiOwnerPluginActions<MultisigModularAccount<TSigner>> &
      PluginManagerActions<MultisigModularAccount<TSigner>> &
      AccountLoupeActions<MultisigModularAccount<TSigner>>,
    MultisigUserOperationContext
  >
>;

export async function createMultisigAccountAlchemyClient(
  config: AlchemyMultisigAccountClientConfig
): Promise<AlchemySmartAccountClient> {
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
    .extend(multisigPluginActions)
    .extend(pluginManagerActions)
    .extend(accountLoupeActions);
}
