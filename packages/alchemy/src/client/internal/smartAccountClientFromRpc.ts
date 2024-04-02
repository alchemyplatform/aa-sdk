import {
  createSmartAccountClientFromExisting,
  getDefaultUserOperationFeeOptions,
  type EntryPointVersion,
  type SmartContractAccount,
} from "@alchemy/aa-core";
import type { Chain, CustomTransport, HttpTransport, Transport } from "viem";
import { alchemyFeeEstimator } from "../../middleware/feeEstimator.js";
import { alchemyGasManagerMiddleware } from "../../middleware/gasManager.js";
import { alchemyUserOperationSimulator } from "../../middleware/userOperationSimulator.js";
import { alchemyActions } from "../decorators/smartAccount.js";
import type {
  AlchemySmartAccountClient,
  AlchemySmartAccountClientConfig,
} from "../smartAccountClient";
import type { ClientWithAlchemyMethods } from "../types";

export type CreateAlchemySmartAccountClientFromRpcClient<
  TEntryPointVersion extends EntryPointVersion,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
> = Omit<
  AlchemySmartAccountClientConfig<
    TEntryPointVersion,
    Transport,
    Chain,
    TAccount
  >,
  "rpcUrl" | "chain" | "apiKey" | "jwt"
> & { client: ClientWithAlchemyMethods<TEntryPointVersion> };

/**
 * Helper method meant to be used internally to create an alchemy smart account client
 * from an existing Alchemy Rpc Client
 */
export function createAlchemySmartAccountClientFromRpcClient<
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined,
  TEntryPointVersion extends EntryPointVersion = TAccount extends SmartContractAccount<
    infer U
  >
    ? U
    : EntryPointVersion,
  TChain extends Chain | undefined = Chain | undefined
>({
  opts,
  account,
  useSimulation,
  gasManagerConfig,
  feeEstimator,
  gasEstimator,
  customMiddleware,
  client,
}: CreateAlchemySmartAccountClientFromRpcClient<
  TEntryPointVersion,
  TAccount
>): AlchemySmartAccountClient<
  TEntryPointVersion,
  CustomTransport,
  TChain,
  TAccount
> {
  const feeOptions =
    opts?.feeOptions ?? getDefaultUserOperationFeeOptions(client.chain);

  return createSmartAccountClientFromExisting<
    TAccount,
    TEntryPointVersion,
    HttpTransport,
    TChain,
    ClientWithAlchemyMethods<TEntryPointVersion>
  >({
    account,
    client,
    type: "AlchemySmartAccountClient",
    opts: {
      ...opts,
      feeOptions,
    },
    customMiddleware,
    feeEstimator: feeEstimator ?? alchemyFeeEstimator(client),
    userOperationSimulator: useSimulation
      ? alchemyUserOperationSimulator(client)
      : undefined,
    gasEstimator,
    ...(gasManagerConfig &&
      alchemyGasManagerMiddleware(client, {
        ...gasManagerConfig,
        gasEstimationOptions: {
          ...gasManagerConfig.gasEstimationOptions,
          disableGasEstimation:
            gasManagerConfig.gasEstimationOptions?.disableGasEstimation ??
            false,
          fallbackFeeDataGetter:
            gasManagerConfig.gasEstimationOptions?.fallbackFeeDataGetter ??
            feeEstimator,
          fallbackGasEstimator:
            gasManagerConfig.gasEstimationOptions?.fallbackGasEstimator ??
            gasEstimator,
        },
      })),
  }).extend(alchemyActions) as AlchemySmartAccountClient<
    TEntryPointVersion,
    CustomTransport,
    TChain,
    TAccount
  >;
}
