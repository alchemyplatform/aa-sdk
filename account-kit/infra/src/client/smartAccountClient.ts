import {
  ChainNotFoundError,
  createSmartAccountClient,
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
import type { AlchemyTransport } from "../alchemyTransport.js";
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
  policyId?: string;
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
> = Prettify<AlchemySmartAccountClient_Base<chain, account, actions, context>>;

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
export function createAlchemySmartAccountClient({
  account,
  policyId,
  useSimulation,
  feeEstimator,
  customMiddleware,
  gasEstimator,
  signUserOperation,
  transport,
  chain,
  opts,
}: AlchemySmartAccountClientConfig): AlchemySmartAccountClient {
  if (!chain) {
    throw new ChainNotFoundError();
  }

  const feeOptions =
    opts?.feeOptions ?? getDefaultUserOperationFeeOptions(chain);

  const gasAndPaymasterAndDataMiddleware = policyId
    ? alchemyGasAndPaymasterAndDataMiddleware(policyId)
    : undefined;

  const scaClient = createSmartAccountClient({
    account,
    transport,
    chain,
    type: "AlchemySmartAccountClient",
    opts: {
      ...opts,
      feeOptions,
    },
    dummyPaymasterAndData:
      gasAndPaymasterAndDataMiddleware?.dummyPaymasterAndData,
    feeEstimator:
      feeEstimator ??
      gasAndPaymasterAndDataMiddleware?.feeEstimator ??
      alchemyFeeEstimator(transport),
    gasEstimator:
      gasEstimator ?? gasAndPaymasterAndDataMiddleware?.gasEstimator,
    customMiddleware: async (struct, args) => {
      if (isSmartAccountWithSigner(args.account)) {
        transport.updateHeaders(getSignerTypeHeader(args.account));
      }
      return customMiddleware ? customMiddleware(struct, args) : struct;
    },
    paymasterAndData: gasAndPaymasterAndDataMiddleware?.paymasterAndData,
    userOperationSimulator: useSimulation
      ? alchemyUserOperationSimulator(transport)
      : undefined,
    signUserOperation,
  }).extend(alchemyActions);

  if (account && isSmartAccountWithSigner(account)) {
    transport.updateHeaders(getSignerTypeHeader(account));
  }

  return scaClient;
}
