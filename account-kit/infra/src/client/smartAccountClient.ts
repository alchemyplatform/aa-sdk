import {
  type Prettify,
  type SmartAccountClient,
  type SmartAccountClientActions,
  type SmartAccountClientConfig,
  type SmartAccountClientRpcSchema,
  type SmartContractAccount,
  type UserOperationContext,
} from "@aa-sdk/core";
import { type Chain, type Transport } from "viem";
import { getDefaultUserOperationFeeOptions } from "../defaults.js";
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
  policyId?: string;
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
  policyId,
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

/**
 * Creates an Alchemy smart account client using the provided configuration options, including account details, gas manager configuration, and custom middleware.
 *
 * @example
 * ```ts
 * import { createAlchemySmartAccountClient } from "@account-kit/infra";
 * import { sepolia } from "@account-kit/infra/chain";
 *
 * const client = createAlchemySmartAccountClient({
 *  chain: sepolia,
 *  apiKey: "your-api-key",
 * });
 * ```
 *
 * @param {AlchemySmartAccountClientConfig} config The configuration for creating the Alchemy smart account client
 * @returns {AlchemySmartAccountClient} An instance of `AlchemySmartAccountClient` configured based on the provided options
 */
export function createAlchemySmartAccountClient({
  account,
  policyId,
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
    policyId,
    useSimulation,
    feeEstimator,
    customMiddleware,
    gasEstimator,
    signUserOperation,
  });
}
