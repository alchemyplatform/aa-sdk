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
import { defaultFeeEstimator } from "./defaults/feeEstimator.js";
import { defaultGasEstimator } from "./defaults/gasEstimator.js";
import { defaultPaymasterAndData } from "./defaults/paymasterAndData.js";
import { noopMiddleware } from "./noopMiddleware.js";
import type { ClientMiddleware } from "./types.js";

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

export const middlewareActions =
  (overrides: Partial<ClientMiddleware>) =>
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
        overrides.dummyPaymasterAndData ?? defaultPaymasterAndData,
      feeEstimator: overrides.feeEstimator ?? defaultFeeEstimator(client),
      gasEstimator: overrides.gasEstimator ?? defaultGasEstimator(client),
      paymasterAndData: overrides.paymasterAndData ?? defaultPaymasterAndData,
      userOperationSimulator:
        overrides.userOperationSimulator ?? noopMiddleware,
    },
  });
