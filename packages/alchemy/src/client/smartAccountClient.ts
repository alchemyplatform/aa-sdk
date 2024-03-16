import {
  type EntryPointVersion,
  type Prettify,
  type SmartAccountClient,
  type SmartAccountClientActions,
  type SmartAccountClientConfig,
  type SmartAccountClientRpcSchema,
  type SmartContractAccount,
} from "@alchemy/aa-core";
import { type Chain, type Transport } from "viem";
import { getDefaultUserOperationFeeOptions } from "../defaults.js";
import { type AlchemyGasManagerConfig } from "../middleware/gasManager.js";
import { AlchemyProviderConfigSchema } from "../schema.js";
import type { AlchemyProviderConfig } from "../type.js";
import type { AlchemySmartAccountClientActions } from "./decorators/smartAccount.js";
import { createAlchemySmartAccountClientFromRpcClient } from "./internal/smartAccountClientFromRpc.js";
import { createAlchemyPublicRpcClient } from "./rpcClient.js";
import type { AlchemyRpcSchema } from "./types.js";

export type AlchemySmartAccountClientConfig<
  version extends EntryPointVersion,
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount<version> | undefined =
    | SmartContractAccount<version>
    | undefined
> = {
  account?: account;
  useSimulation?: boolean;
  gasManagerConfig?: AlchemyGasManagerConfig;
} & AlchemyProviderConfig &
  Pick<
    SmartAccountClientConfig<version, transport, chain, account>,
    "customMiddleware" | "feeEstimator" | "gasEstimator"
  >;

export type BaseAlchemyActions<
  version extends EntryPointVersion,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount<version> | undefined =
    | SmartContractAccount<version>
    | undefined
> = SmartAccountClientActions<version, chain, account> &
  AlchemySmartAccountClientActions<version, account>;

export type AlchemySmartAccountClient_Base<
  version extends EntryPointVersion,
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount<version> | undefined =
    | SmartContractAccount<version>
    | undefined,
  actions extends BaseAlchemyActions<
    version,
    chain,
    account
  > = BaseAlchemyActions<version, chain, account>
> = Prettify<
  SmartAccountClient<
    version,
    transport,
    chain,
    account,
    actions,
    [...SmartAccountClientRpcSchema<version>, ...AlchemyRpcSchema<version>]
  >
>;

export type AlchemySmartAccountClient<
  version extends EntryPointVersion,
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount<version> | undefined =
    | SmartContractAccount<version>
    | undefined,
  actions extends BaseAlchemyActions<
    version,
    chain,
    account
  > = BaseAlchemyActions<version, chain, account>
> = Prettify<
  AlchemySmartAccountClient_Base<version, transport, chain, account, actions>
>;

export function createAlchemySmartAccountClient<
  TEntryPointVersion extends EntryPointVersion,
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
>({
  account,
  gasManagerConfig,
  useSimulation,
  feeEstimator,
  customMiddleware,
  gasEstimator,
  ...config_
}: AlchemySmartAccountClientConfig<
  TEntryPointVersion,
  TTransport,
  TChain,
  TAccount
>): AlchemySmartAccountClient<
  TEntryPointVersion,
  TTransport,
  TChain,
  TAccount
> {
  const config = AlchemyProviderConfigSchema.parse(config_);
  const { chain, opts, ...connectionConfig } = config;

  const client = createAlchemyPublicRpcClient({
    chain,
    connectionConfig,
  });

  const feeOptions =
    opts?.feeOptions ?? getDefaultUserOperationFeeOptions(chain);

  return createAlchemySmartAccountClientFromRpcClient({
    client,
    account,
    opts: {
      ...opts,
      feeOptions,
    },
    gasManagerConfig,
    useSimulation,
    feeEstimator,
    customMiddleware,
    gasEstimator,
  }) as AlchemySmartAccountClient<
    TEntryPointVersion,
    TTransport,
    TChain,
    TAccount
  >;
}
