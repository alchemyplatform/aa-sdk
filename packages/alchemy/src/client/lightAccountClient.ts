import {
  createLightAccount,
  lightAccountClientActions,
  type CreateLightAccountParams,
  type LightAccount,
} from "@alchemy/aa-accounts";
import type {
  EntryPointDef,
  EntryPointVersion,
  SmartAccountSigner,
} from "@alchemy/aa-core";
import { custom, type Chain, type Transport } from "viem";
import type { CustomTransport } from "viem/_types/clients/transports/custom.js";
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
  CreateLightAccountParams<TEntryPointVersion, Transport, TSigner>,
  "transport" | "chain"
> &
  Omit<
    AlchemySmartAccountClientConfig<
      TEntryPointVersion,
      CustomTransport,
      Chain,
      LightAccount<TEntryPointVersion, TSigner>
    >,
    "account"
  >;

export async function createLightAccountAlchemyClient<
  TAccount extends LightAccount<TEntryPointVersion, TSigner> | undefined,
  TEntryPointVersion extends EntryPointVersion = TAccount extends LightAccount<
    infer U
  >
    ? U
    : EntryPointVersion,
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

  const account = (await createLightAccount<EntryPointDef<TEntryPointVersion>>({
    transport: custom(client),
    ...params,
  })) as LightAccount<TEntryPointVersion, TSigner>;

  return createAlchemySmartAccountClientFromRpcClient({
    ...params,
    client,
    account,
    opts,
  }).extend(lightAccountClientActions);
}
