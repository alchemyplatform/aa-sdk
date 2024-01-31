import {
  createLightAccount,
  type CreateLightAccountParams,
  type LightAccount,
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
  TOwner extends SmartAccountSigner = SmartAccountSigner
> = Omit<
  CreateLightAccountParams<HttpTransport, TOwner>,
  "transport" | "chain"
> &
  Omit<
    AlchemySmartAccountClientConfig<Transport, Chain, LightAccount<TOwner>>,
    "account"
  >;

export const createLightAccountAlchemyClient: <
  TOwner extends SmartAccountSigner = SmartAccountSigner
>(
  params: AlchemyLightAccountClientConfig<TOwner>
) => Promise<
  AlchemySmartAccountClient<
    CustomTransport,
    Chain | undefined,
    LightAccount<TOwner>
  >
> = async (config) => {
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
  });
};
