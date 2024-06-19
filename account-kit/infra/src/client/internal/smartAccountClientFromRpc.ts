import {
  createSmartAccountClientFromExisting,
  getDefaultUserOperationFeeOptions,
  isSmartAccountWithSigner,
  type SmartContractAccount,
  type SmartContractAccountWithSigner,
  type UserOperationContext,
} from "@alchemy/aa-core";
import type { Chain, CustomTransport, Transport } from "viem";
import { alchemyFeeEstimator } from "../../middleware/feeEstimator.js";
import { alchemyGasManagerMiddleware } from "../../middleware/gasManager.js";
import { alchemyUserOperationSimulator } from "../../middleware/userOperationSimulator.js";
import { alchemyActions } from "../decorators/smartAccount.js";
import type {
  AlchemySmartAccountClient,
  AlchemySmartAccountClientConfig,
} from "../smartAccountClient.js";
import type { ClientWithAlchemyMethods } from "../types.js";

export type CreateAlchemySmartAccountClientFromRpcClientParams<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined
> = Omit<
  AlchemySmartAccountClientConfig<Transport, Chain, TAccount, TContext>,
  "rpcUrl" | "chain" | "apiKey" | "jwt"
> & { client: ClientWithAlchemyMethods };

export function getSignerTypeHeader<
  TAccount extends SmartContractAccountWithSigner
>(account: TAccount) {
  return { "Alchemy-Aa-Sdk-Signer": account.getSigner().signerType };
}

/**
 * Helper method meant to be used internally to create an alchemy smart account client
 * from an existing Alchemy Rpc Client
 *
 * @param args configuration for the client
 * @returns a smart account client configured to use Alchemy's RPC
 */
export function createAlchemySmartAccountClientFromRpcClient<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined
>(
  args: CreateAlchemySmartAccountClientFromRpcClientParams<TAccount, TContext>
): AlchemySmartAccountClient<
  CustomTransport,
  TChain,
  TAccount,
  Record<string, never>,
  TContext
>;

/**
 * Creates an AlchemySmartAccountClient using the provided RPC client configuration, including options, account, simulation settings, gas management, fee estimation, middleware and user operation signing.
 *
 * @example
 * ```ts
 * import { createAlchemySmartAccountClientFromRpcClient, createAlchemyPublicRpcClient } from "@account-kit/infra";
 *
 * const client = createAlchemyPublicRpcClient(...);
 * const scaClient = createAlchemySmartAccountClientFromRpcClient({
 *  client,
 *  ...
 * });
 * ```
 *
 * @param {CreateAlchemySmartAccountClientFromRpcClientParams} args The configuration object containing all required parameters
 * @returns {AlchemySmartAccountClient} An instance of AlchemySmartAccountClient
 */
export function createAlchemySmartAccountClientFromRpcClient(
  args: CreateAlchemySmartAccountClientFromRpcClientParams
): AlchemySmartAccountClient {
  const {
    opts,
    account,
    useSimulation,
    gasManagerConfig,
    feeEstimator,
    gasEstimator,
    customMiddleware,
    signUserOperation,
    client,
  } = args;
  const feeOptions =
    opts?.feeOptions ?? getDefaultUserOperationFeeOptions(client.chain);

  const scaClient = createSmartAccountClientFromExisting({
    account,
    client,
    type: "AlchemySmartAccountClient",
    opts: {
      ...opts,
      feeOptions,
    },
    customMiddleware: async (struct, args) => {
      if (isSmartAccountWithSigner(args.account)) {
        client.updateHeaders(getSignerTypeHeader(args.account));
      }

      return customMiddleware ? customMiddleware(struct, args) : struct;
    },
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
    signUserOperation,
  }).extend(alchemyActions);

  if (account && isSmartAccountWithSigner(account)) {
    client.updateHeaders(getSignerTypeHeader(account));
  }

  return scaClient;
}
