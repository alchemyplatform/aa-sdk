import {
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
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = {
  account?: account;
  useSimulation?: boolean;
  // TODO: this is missing the current gas manager fallback stuff
  gasManagerConfig?: AlchemyGasManagerConfig;
} & AlchemyProviderConfig &
  Pick<
    SmartAccountClientConfig<transport, chain, account>,
    "customMiddleware" | "feeEstimator" | "gasEstimator"
  >;

export type AlchemySmartAccountClient_Base<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  actions extends SmartAccountClientActions<
    chain,
    account
  > = SmartAccountClientActions<chain, account> &
    AlchemySmartAccountClientActions<account>
> = Prettify<
  SmartAccountClient<
    transport,
    chain,
    account,
    actions,
    [...SmartAccountClientRpcSchema, ...AlchemyRpcSchema]
  >
>;

export type AlchemySmartAccountClient<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = Prettify<AlchemySmartAccountClient_Base<transport, chain, account>>;

export function createAlchemySmartAccountClient<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
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
  TTransport,
  TChain,
  TAccount
>): AlchemySmartAccountClient<TTransport, TChain, TAccount>;

export function createAlchemySmartAccountClient({
  account,
  gasManagerConfig,
  useSimulation,
  feeEstimator,
  customMiddleware,
  gasEstimator,
  ...config_
}: AlchemySmartAccountClientConfig): AlchemySmartAccountClient {
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
    feeEstimator,
    customMiddleware,
    gasEstimator,
    useSimulation,
  });
}
