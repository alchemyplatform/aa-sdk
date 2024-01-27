import {
  createSmartAccountClientFromExisting,
  type Prettify,
  type SmartAccountClient,
  type SmartAccountClientActions,
  type SmartAccountClientRpcSchema,
  type SmartContractAccount,
} from "@alchemy/aa-core";
import { type Chain, type Transport } from "viem";
import { getDefaultUserOperationFeeOptions } from "../defaults.js";
import { alchemyFeeEstimator } from "../middleware/feeEstimator.js";
import {
  alchemyGasManagerMiddleware,
  type AlchemyGasManagerConfig,
} from "../middleware/gasManager.js";
import { alchemyUserOperationSimulator } from "../middleware/userOperationSimulator.js";
import { AlchemyProviderConfigSchema } from "../schema.js";
import type { AlchemyProviderConfig } from "../type.js";
import {
  alchemyActions,
  type AlchemySmartAccountClientActions,
} from "./decorators/smartAccount.js";
import { createAlchemyPublicRpcClient } from "./rpc.js";
import type { AlchemyRpcSchema } from "./types.js";

export type AlchemySmartAccountClientConfig<
  account extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = {
  account?: account;
  useSimulation?: boolean;
  // TODO: this is missing the current gas manager fallback stuff
  gasManagerConfig?: AlchemyGasManagerConfig;
} & AlchemyProviderConfig;

export type AlchemySmartAccountClient_Base<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  actions extends SmartAccountClientActions<
    chain,
    account
  > = SmartAccountClientActions<chain, account>
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
> = Prettify<
  AlchemySmartAccountClient_Base<
    transport,
    chain,
    account,
    AlchemySmartAccountClientActions<account> &
      SmartAccountClientActions<chain, account>
  >
>;

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
  ...config_
}: AlchemySmartAccountClientConfig<TAccount>): AlchemySmartAccountClient<
  TTransport,
  TChain,
  TAccount
>;

// TODO: this is missing the additional logic for the gas manager fallback stuff
// TODO: this is missing the simulation action
// TODO: this is missing the extend with alchemy sdk stuff
// TODO: we should consider allowing this client to be created with a PublicErc4337Client that way one public client can be shared between
// the account and this one. We could probably export an AlchemyRpcClient from this package which extends PublicErc4337Client
export function createAlchemySmartAccountClient<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>({
  account,
  gasManagerConfig,
  useSimulation,
  ...config_
}: AlchemySmartAccountClientConfig<TAccount>): AlchemySmartAccountClient {
  const config = AlchemyProviderConfigSchema.parse(config_);
  const { chain, opts, ...connectionConfig } = config;

  const client = createAlchemyPublicRpcClient({
    chain,
    connectionConfig,
  });

  const feeOptions =
    config.opts?.feeOptions ?? getDefaultUserOperationFeeOptions(chain);

  return createSmartAccountClientFromExisting({
    account,
    client,
    opts: {
      ...opts,
      feeOptions,
    },
    feeEstimator: alchemyFeeEstimator(client),
    userOperationSimulator: useSimulation
      ? alchemyUserOperationSimulator(client)
      : undefined,
    ...(gasManagerConfig
      ? alchemyGasManagerMiddleware(client, gasManagerConfig)
      : {}),
  }).extend(alchemyActions);
}
