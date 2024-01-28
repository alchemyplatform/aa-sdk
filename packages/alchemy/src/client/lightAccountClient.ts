import {
  createLightAccount,
  type CreateLightAccountParams,
  type LightAccount,
} from "@alchemy/aa-accounts";
import type { HttpTransport, SmartAccountSigner } from "@alchemy/aa-core";
import type { Chain, Transport } from "viem";
import { AlchemyProviderConfigSchema } from "../schema.js";
import { createAlchemySmartAccountClientFromRpcClient } from "./internal/smartAccountClientFromRpc.js";
import { createAlchemyPublicRpcClient } from "./rpcClient.js";
import { type AlchemySmartAccountClientConfig } from "./smartAccountClient.js";

export type AlchemyLightAccountClientConfig<
  TOwner extends SmartAccountSigner = SmartAccountSigner
> = Omit<CreateLightAccountParams<HttpTransport, TOwner>, "client"> &
  Omit<
    AlchemySmartAccountClientConfig<Transport, Chain, LightAccount<TOwner>>,
    "account"
  >;

export const createLightAccountAlchemyClient = async <
  TOwner extends SmartAccountSigner = SmartAccountSigner
>({
  gasManagerConfig,
  useSimulation,
  dummyPaymasterAndData,
  feeEstimator,
  customMiddleware,
  gasEstimator,
  paymasterAndData,
  ...config_
}: AlchemyLightAccountClientConfig<TOwner>) => {
  const { chain, opts, ...connectionConfig } =
    AlchemyProviderConfigSchema.parse(config_);

  const client = createAlchemyPublicRpcClient({
    chain,
    connectionConfig,
  });

  const account = await createLightAccount({
    client,
    ...config_,
  });

  return createAlchemySmartAccountClientFromRpcClient({
    client,
    account,
    opts,
    ...config_,
  });
};
