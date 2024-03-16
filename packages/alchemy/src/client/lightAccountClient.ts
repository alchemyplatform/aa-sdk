import {
  createLightAccount,
  lightAccountClientActions,
  type CreateLightAccountParams,
  type LightAccount,
} from "@alchemy/aa-accounts";
import type {
  EntryPointVersion,
  HttpTransport,
  SmartAccountSigner,
} from "@alchemy/aa-core";
import { custom, type Chain, type CustomTransport, type Transport } from "viem";
import { AlchemyProviderConfigSchema } from "../schema.js";
import { createAlchemySmartAccountClientFromRpcClient } from "./internal/smartAccountClientFromRpc.js";
import { createAlchemyPublicRpcClient } from "./rpcClient.js";
import {
  type AlchemySmartAccountClient,
  type AlchemySmartAccountClientConfig,
} from "./smartAccountClient.js";

export type AlchemyLightAccountClientConfig<
  TEntryPointVersion extends EntryPointVersion,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Omit<
  CreateLightAccountParams<TEntryPointVersion, HttpTransport, TSigner>,
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

export async function createLightAccountAlchemyClient<
  TEntryPointVersion extends EntryPointVersion,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  params: AlchemyLightAccountClientConfig<TEntryPointVersion, TSigner>
): Promise<
  AlchemySmartAccountClient<
    TEntryPointVersion,
    CustomTransport,
    Chain | undefined,
    LightAccount<TEntryPointVersion, TSigner>
  >
> {
  const { chain, opts, ...connectionConfig } =
    AlchemyProviderConfigSchema.parse(params);

  const client = createAlchemyPublicRpcClient<TEntryPointVersion>({
    chain,
    connectionConfig,
  });

  const account = await createLightAccount({
    transport: custom(client),
    ...params,
  });

  return createAlchemySmartAccountClientFromRpcClient({
    ...params,
    client,
    account,
    opts,
  }).extend(lightAccountClientActions);
}
