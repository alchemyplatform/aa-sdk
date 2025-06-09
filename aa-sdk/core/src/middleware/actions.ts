import {
  type Chain,
  type Client,
  type PublicActions,
  type PublicRpcSchema,
  type Transport,
} from "viem";
import type { SmartContractAccount } from "../account/smartContractAccount.js";
import type {
  BundlerActions,
  BundlerRpcSchema,
} from "../client/decorators/bundlerClient.js";
import type { ClientMiddlewareConfig } from "../client/types.js";
import { defaultFeeEstimator } from "./defaults/feeEstimator.js";
import { defaultGasEstimator } from "./defaults/gasEstimator.js";
import { defaultPaymasterAndData } from "./defaults/paymasterAndData.js";
import { defaultUserOpSigner } from "./defaults/userOpSigner.js";
import { noopMiddleware } from "./noopMiddleware.js";
import type { ClientMiddleware } from "./types.js";

/**
 * Middleware client type
 *
 * @template {Transport} TTransport
 * @template {Chain | undefined} TChain
 * @template {SmartContractAccount | undefined} TAccount
 */
export type MiddlewareClient<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
> = Client<
  TTransport,
  TChain,
  TAccount,
  [...BundlerRpcSchema, ...PublicRpcSchema],
  PublicActions & BundlerActions
>;

/**
 * function that takes in ClientMiddlewareConfig used during client initiation
 * and returns the middleware actions object that the smart account client extends with
 *
 * @param {ClientMiddlewareConfig} overrides config used during client initiation for overriding default middlewares
 * @returns {(client: MiddlewareClient<TTransport, TChain, TAccount>) => { middleware: ClientMiddleware }} middleware actions object
 */
export const middlewareActions =
  (overrides: ClientMiddlewareConfig) =>
  <
    TTransport extends Transport = Transport,
    TChain extends Chain | undefined = Chain | undefined,
    TAccount extends SmartContractAccount | undefined =
      | SmartContractAccount
      | undefined,
  >(
    client: MiddlewareClient<TTransport, TChain, TAccount>,
  ): { middleware: ClientMiddleware } => ({
    middleware: {
      customMiddleware: overrides.customMiddleware ?? noopMiddleware,
      dummyPaymasterAndData:
        overrides.dummyPaymasterAndData ?? defaultPaymasterAndData,
      feeEstimator: overrides.feeEstimator ?? defaultFeeEstimator(client),
      gasEstimator: overrides.gasEstimator ?? defaultGasEstimator(client),
      paymasterAndData: overrides.paymasterAndData ?? defaultPaymasterAndData,
      userOperationSimulator:
        overrides.userOperationSimulator ?? noopMiddleware,
      signUserOperation: overrides.signUserOperation ?? defaultUserOpSigner,
    },
  });
