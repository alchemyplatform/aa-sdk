import {
  createLightAccount,
  lightAccountClientActions,
  type CreateLightAccountParams,
  type LightAccount,
  type LightAccountClientActions,
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

export type AlchemyLightAccountClientConfig<
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Omit<
  CreateLightAccountParams<HttpTransport, TSigner>,
  "transport" | "chain"
> &
  Omit<
    AlchemySmartAccountClientConfig<Transport, Chain, LightAccount<TSigner>>,
    "account"
  >;

export async function createLightAccountAlchemyClient<
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  params: AlchemyLightAccountClientConfig<TSigner>
): Promise<
  AlchemySmartAccountClient<
    CustomTransport,
    Chain | undefined,
    LightAccount<TSigner>,
    LightAccountClientActions<TSigner>
  >
>;

export async function createLightAccountAlchemyClient(
  config: AlchemyLightAccountClientConfig
): Promise<AlchemySmartAccountClient> {
  const { chain, opts, ...connectionConfig } =
    AlchemyProviderConfigSchema.parse(config);

  const client = createAlchemyPublicRpcClient({
    chain,
    connectionConfig,
  });

  const account = await createLightAccount({
    transport: custom(client),
    ...config,
  });

  return createAlchemySmartAccountClientFromRpcClient({
    ...config,
    client,
    account,
    opts,
  }).extend(lightAccountClientActions);
}
