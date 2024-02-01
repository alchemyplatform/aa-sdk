import {
  accountLoupeActions,
  createMultiOwnerModularAccount,
  multiOwnerPluginActions,
  pluginManagerActions,
  type CreateMultiOwnerModularAccountParams,
  type LightAccount,
  type MultiOwnerModularAccount,
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
} from "./smartAccountClient";

export type AlchemyModularAccountClientConfig<
  TOwner extends SmartAccountSigner = SmartAccountSigner
> = Omit<
  CreateMultiOwnerModularAccountParams<HttpTransport, TOwner>,
  "transport" | "chain"
> &
  Omit<
    AlchemySmartAccountClientConfig<Transport, Chain, LightAccount<TOwner>>,
    "account"
  >;

export const createModularAccountAlchemyClient: <
  TOwner extends SmartAccountSigner = SmartAccountSigner
>(
  params: AlchemyModularAccountClientConfig<TOwner>
) => Promise<
  AlchemySmartAccountClient<
    CustomTransport,
    Chain | undefined,
    MultiOwnerModularAccount<TOwner>
  >
> = async (config) => {
  const { chain, opts, ...connectionConfig } =
    AlchemyProviderConfigSchema.parse(config);

  const client = createAlchemyPublicRpcClient({
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
};
