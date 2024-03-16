import {
  createMultiOwnerLightAccount,
  multiOwnerLightAccountClientActions,
  type CreateMultiOwnerLightAccountParams,
  type MultiOwnerLightAccount,
  type MultiOwnerLightAccountClientActions,
} from "@alchemy/aa-accounts";
import type { HttpTransport, SmartAccountSigner } from "@alchemy/aa-core";
import { custom, type Chain, type CustomTransport, type Transport } from "viem";
import { AlchemyProviderConfigSchema } from "../schema.js";
import { createAlchemySmartAccountClientFromRpcClient } from "./internal/smartAccountClientFromRpc.js";
import { createAlchemyPublicRpcClient } from "./rpcClient.js";
import {
  type AlchemySmartAccountClient,
  type AlchemySmartAccountClientConfig,
} from "./smartAccountClient.js";

export type AlchemyMultiOwnerLightAccountClientConfig<
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Omit<
  CreateMultiOwnerLightAccountParams<HttpTransport, TSigner>,
  "transport" | "chain"
> &
  Omit<
    AlchemySmartAccountClientConfig<
      Transport,
      Chain,
      MultiOwnerLightAccount<TSigner>
    >,
    "account"
  >;

export async function createMultiOwnerLightAccountAlchemyClient<
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  params: AlchemyMultiOwnerLightAccountClientConfig<TSigner>
): Promise<
  AlchemySmartAccountClient<
    CustomTransport,
    Chain | undefined,
    MultiOwnerLightAccount<TSigner>,
    MultiOwnerLightAccountClientActions<TSigner>
  >
>;

export async function createMultiOwnerLightAccountAlchemyClient(
  config: AlchemyMultiOwnerLightAccountClientConfig
): Promise<AlchemySmartAccountClient> {
  const { chain, opts, ...connectionConfig } =
    AlchemyProviderConfigSchema.parse(config);

  const client = createAlchemyPublicRpcClient({
    chain,
    connectionConfig,
  });

  const account = await createMultiOwnerLightAccount({
    transport: custom(client),
    ...config,
  });

  return createAlchemySmartAccountClientFromRpcClient({
    ...config,
    client,
    account,
    opts,
  }).extend(multiOwnerLightAccountClientActions);
}
