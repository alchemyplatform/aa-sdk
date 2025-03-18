import {
  ADD_BREADCRUMB,
  ChainNotFoundError,
  createSmartAccountClient,
  headersUpdate,
  isSmartAccountWithSigner,
  type Prettify,
  type SmartAccountClient,
  type SmartAccountClientActions,
  type SmartAccountClientConfig,
  type SmartAccountClientRpcSchema,
  type SmartContractAccount,
  type SmartContractAccountWithSigner,
  type UserOperationContext,
} from "@aa-sdk/core";
import { type Chain } from "viem";
import {
  alchemy,
  convertHeadersToObject,
  type AlchemyTransport,
} from "../alchemyTransport.js";
import { getDefaultUserOperationFeeOptions } from "../defaults.js";
import { alchemyFeeEstimator } from "../middleware/feeEstimator.js";
import { alchemyGasAndPaymasterAndDataMiddleware } from "../middleware/gasManager.js";
import { alchemyUserOperationSimulator } from "../middleware/userOperationSimulator.js";
import {
  alchemyActions,
  type AlchemySmartAccountClientActions,
} from "./decorators/smartAccount.js";
import type { AlchemyRpcSchema } from "./types.js";

export function getSignerTypeHeader<
  TAccount extends SmartContractAccountWithSigner
>(account: TAccount) {
  return { "Alchemy-Aa-Sdk-Signer": account.getSigner().signerType };
}

// #region AlchemySmartAccountClientConfig
export type AlchemySmartAccountClientConfig<
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
  policyId?: string | string[];
} & Pick<
  SmartAccountClientConfig<AlchemyTransport, chain, account, context>,
  | "customMiddleware"
  | "feeEstimator"
  | "gasEstimator"
  | "signUserOperation"
  | "transport"
  | "chain"
  | "opts"
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
    AlchemyTransport,
    chain,
    account,
    actions & BaseAlchemyActions<chain, account, context>,
    [...SmartAccountClientRpcSchema, ...AlchemyRpcSchema],
    context
  >
>;

export type AlchemySmartAccountClient<
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  actions extends Record<string, unknown> = Record<string, unknown>,
  context extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined
> = Prettify<
  AlchemySmartAccountClient_Base<chain, account, actions, context> & {
    [ADD_BREADCRUMB]: (
      breadcrumb: string
    ) => AlchemySmartAccountClient_Base<chain, account, actions, context>;
  }
>;

export function createAlchemySmartAccountClient<
  TChain extends Chain = Chain,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined
>(
  params: AlchemySmartAccountClientConfig<TChain, TAccount, TContext>
): AlchemySmartAccountClient<TChain, TAccount, Record<string, never>, TContext>;

/**
 * Creates an Alchemy smart account client using the provided configuration options, including account details, gas manager configuration, and custom middleware.
 *
 * @example
 * ```ts
 * import { createAlchemySmartAccountClient, alchemy } from "@account-kit/infra";
 * import { sepolia } from "@account-kit/infra/chain";
 *
 * const client = createAlchemySmartAccountClient({
 *  chain: sepolia,
 *  transport: alchemy({ apiKey: "your-api-key" }),
 * });
 * ```
 *
 * @param {AlchemySmartAccountClientConfig} config The configuration for creating the Alchemy smart account client
 * @returns {AlchemySmartAccountClient} An instance of `AlchemySmartAccountClient` configured based on the provided options
 */
export function createAlchemySmartAccountClient(
  config: AlchemySmartAccountClientConfig
): AlchemySmartAccountClient {
  if (!config.chain) {
    throw new ChainNotFoundError();
  }

  const feeOptions =
    config.opts?.feeOptions ?? getDefaultUserOperationFeeOptions(config.chain);

  const scaClient = createSmartAccountClient({
    account: config.account,
    transport: config.transport,
    chain: config.chain,
    type: "AlchemySmartAccountClient",
    opts: {
      ...config.opts,
      feeOptions,
    },
    feeEstimator: config.feeEstimator ?? alchemyFeeEstimator(config.transport),
    gasEstimator: config.gasEstimator,
    customMiddleware: async (struct, args) => {
      if (isSmartAccountWithSigner(args.account)) {
        config.transport.updateHeaders(getSignerTypeHeader(args.account));
      }
      return config.customMiddleware
        ? config.customMiddleware(struct, args)
        : struct;
    },
    ...(config.policyId
      ? alchemyGasAndPaymasterAndDataMiddleware({
          policyId: config.policyId,
          transport: config.transport,
          gasEstimatorOverride: config.gasEstimator,
          feeEstimatorOverride: config.feeEstimator,
        })
      : {}),
    userOperationSimulator: config.useSimulation
      ? alchemyUserOperationSimulator(config.transport)
      : undefined,
    signUserOperation: config.signUserOperation,
  }).extend(alchemyActions);

  if (config.account && isSmartAccountWithSigner(config.account)) {
    config.transport.updateHeaders(getSignerTypeHeader(config.account));
  }

  return {
    ...scaClient,
    [ADD_BREADCRUMB](breadcrumb: string) {
      const newTransport = alchemy({ ...config.transport.config });
      const newHeaders = headersUpdate(breadcrumb)({
        ...convertHeadersToObject(
          config.transport.config.fetchOptions?.headers ?? {}
        ),
      });
      console.log(
        "BLUJ New breadcrumb",
        breadcrumb,
        JSON.stringify(newHeaders)
      );
      newTransport.updateHeaders(newHeaders);
      return createAlchemySmartAccountClient({
        ...config,
        transport: newTransport,
      });
    },
  };
}
