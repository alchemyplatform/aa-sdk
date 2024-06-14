import {
  type Prettify,
  type SmartAccountClient,
  type SmartAccountClientActions,
  type SmartAccountClientConfig,
  type SmartAccountClientRpcSchema,
  type SmartContractAccount,
  type UserOperationContext,
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

// #region AlchemySmartAccountClientConfig
export type AlchemySmartAccountClientConfig<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  context extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined
> = {
  account?: account;
  useSimulation?: boolean;
  gasManagerConfig?: AlchemyGasManagerConfig;
} & AlchemyProviderConfig &
  Pick<
    SmartAccountClientConfig<transport, chain, account, context>,
    "customMiddleware" | "feeEstimator" | "gasEstimator" | "signUserOperation"
  >;
// #endregion AlchemySmartAccountClientConfig

export type BaseAlchemyActions<
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  context extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined
> = SmartAccountClientActions<chain, account, context> &
  AlchemySmartAccountClientActions<account, context>;

export type AlchemySmartAccountClient_Base<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  actions extends Record<string, unknown> = Record<string, unknown>,
  context extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined
> = Prettify<
  SmartAccountClient<
    transport,
    chain,
    account,
    actions & BaseAlchemyActions<chain, account, context>,
    [...SmartAccountClientRpcSchema, ...AlchemyRpcSchema],
    context
  >
>;

export type AlchemySmartAccountClient<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  actions extends Record<string, unknown> = Record<string, unknown>,
  context extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined
> = Prettify<
  AlchemySmartAccountClient_Base<transport, chain, account, actions, context>
>;

export function createAlchemySmartAccountClient<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined
>({
  account,
  gasManagerConfig,
  useSimulation,
  feeEstimator,
  customMiddleware,
  gasEstimator,
  signUserOperation,
  ...config_
}: AlchemySmartAccountClientConfig<
  TTransport,
  TChain,
  TAccount,
  TContext
>): AlchemySmartAccountClient<
  TTransport,
  TChain,
  TAccount,
  Record<string, never>,
  TContext
>;

export function createAlchemySmartAccountClient({
  account,
  gasManagerConfig,
  useSimulation,
  feeEstimator,
  customMiddleware,
  gasEstimator,
  signUserOperation,
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
    gasManagerConfig,
    useSimulation,
    feeEstimator,
    customMiddleware,
    gasEstimator,
    signUserOperation,
  });
}
