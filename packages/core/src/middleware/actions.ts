import type {
  Chain,
  Client,
  PublicActions,
  PublicRpcSchema,
  Transport,
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
 * MiddlewareClient type definition where the `viem` client is extended with
 * the public client actions and bundler client actions
 *
 * @template TTransport The transport type
 * @template TChain The chain type
 * @template TAccount The account type
 */
export type MiddlewareClient<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = Client<
  TTransport,
  TChain,
  TAccount,
  [...BundlerRpcSchema, ...PublicRpcSchema],
  PublicActions & BundlerActions
>;

/**
 * middlewareActions function that returns the client middleware object with the
 * middlewares set using the default middlewares or with the middleware overrides if overriden
 * during the client creation.
 *
 * @param overrides the middleware overrides used during the client creation
 * @returns the client middleware object
 */
export const middlewareActions =
  (overrides: ClientMiddlewareConfig) =>
  <
    TTransport extends Transport = Transport,
    TChain extends Chain | undefined = Chain | undefined,
    TAccount extends SmartContractAccount | undefined =
      | SmartContractAccount
      | undefined
  >(
    client: MiddlewareClient<TTransport, TChain, TAccount>
  ): { middleware: ClientMiddleware } => ({
    middleware: {
      customMiddleware: overrides.customMiddleware ?? noopMiddleware,
      dummyPaymasterAndData:
        overrides.paymasterAndData?.dummyPaymasterAndData ??
        defaultPaymasterAndData,
      feeEstimator: overrides.feeEstimator ?? defaultFeeEstimator(client),
      gasEstimator: overrides.gasEstimator ?? defaultGasEstimator(client),
      paymasterAndData:
        overrides.paymasterAndData?.paymasterAndData ?? defaultPaymasterAndData,
      userOperationSimulator:
        overrides.userOperationSimulator ?? noopMiddleware,
      signUserOperation: overrides.signUserOperation ?? defaultUserOpSigner,
    },
  });
