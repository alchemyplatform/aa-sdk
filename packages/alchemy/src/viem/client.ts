import { createPublicErc4337Client, type Prettify } from "@alchemy/aa-core";
import {
  createSmartAccountClient,
  type SmartAccountClient,
  type SmartContractAccount,
} from "@alchemy/aa-core/viem";
import { type Chain, type Transport } from "viem";
import { getDefaultUserOperationFeeOptions } from "../defaults.js";
import type { AlchemyGasManagerConfig } from "../middleware/gas-manager.js";
import { AlchemyProviderConfigSchema } from "../schema.js";
import type { AlchemyProviderConfig } from "../type";
import { alchemyFeeEstimator } from "./middleware/feeEstimator.js";
import { alchemyGasManagerMiddleware } from "./middleware/gasManager.js";
import { alchemyUserOperationSimulator } from "./middleware/userOperationSimulator.js";

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

export type AlchemySmartAccountClient<
  transport extends Transport = Transport,
  chain extends Chain = Chain,
  account extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = Prettify<SmartAccountClient<transport, chain, account>>;

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

  const rpcUrl =
    connectionConfig.rpcUrl == null
      ? `${chain.rpcUrls.alchemy.http[0]}/${connectionConfig.apiKey ?? ""}`
      : connectionConfig.rpcUrl;

  const transport = createPublicErc4337Client({
    chain: chain,
    rpcUrl,
    ...(connectionConfig.jwt != null && {
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${connectionConfig.jwt}`,
        },
      },
    }),
  });

  const feeOptions =
    config.opts?.feeOptions ?? getDefaultUserOperationFeeOptions(chain);

  return createSmartAccountClient({
    account,
    client: transport,
    opts: {
      ...opts,
      feeOptions,
    },
    feeEstimator: alchemyFeeEstimator(transport),
    userOperationSimulator: useSimulation
      ? alchemyUserOperationSimulator(transport)
      : undefined,
    ...(gasManagerConfig
      ? alchemyGasManagerMiddleware(transport, gasManagerConfig)
      : {}),
  });
}
