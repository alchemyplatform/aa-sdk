import type {
  Chain,
  Client,
  PublicActions,
  PublicRpcSchema,
  Transport,
} from "viem";
import type { Erc4337Actions, Erc4337RpcSchema } from "../../client/types.js";
import type { SmartContractAccount } from "../account.js";
import { defaultFeeEstimator } from "./defaults/feeEstimator.js";
import { defaultGasEstimator } from "./defaults/gasEstimator.js";
import { defaultPaymasterAndData } from "./defaults/paymasterAndData.js";
import { noopMiddleware } from "./noopMiddleware.js";
import type { ClientMiddleware } from "./types";

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
  [...Erc4337RpcSchema, ...PublicRpcSchema],
  PublicActions & Erc4337Actions
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
      custom: overrides.custom ?? noopMiddleware,
      dummyPaymasterAndData:
        overrides.dummyPaymasterAndData ?? defaultPaymasterAndData,
      feeEstimator: overrides.feeEstimator ?? defaultFeeEstimator(client),
      gasEstimator: overrides.gasEstimator ?? defaultGasEstimator(client),
      paymasterAndData: overrides.paymasterAndData ?? defaultPaymasterAndData,
      userOperationSimulator:
        overrides.userOperationSimulator ?? noopMiddleware,
    },
  });
