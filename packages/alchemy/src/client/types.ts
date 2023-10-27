import type {
  Erc4337Actions,
  Erc4337RpcSchema,
  SupportedTransports,
  UserOperationRequest,
} from "@alchemy/aa-core";
import type {
  Chain,
  Client,
  PublicActions,
  PublicRpcSchema,
  Transport,
} from "viem";
import type { DebugTransaction, SimulateExecutionResponse } from "./interfaces";

export type AlchemyEnhancedApiSchema = [
  ...PublicRpcSchema,
  ...Erc4337RpcSchema,
  {
    Method: "alchemy_simulateExecution";
    Parameters: [DebugTransaction];
    ReturnType: SimulateExecutionResponse;
  },
  {
    Method: "alchemy_simulateExecutionBundle";
    Parameters: [DebugTransaction[]];
    ReturnType: SimulateExecutionResponse[];
  }
];

export type AlchemyEnhancedApiActions = {
  /**
   * calls `alchemy_simulateUserOperationAssetChanges` and returns the result
   *
   * @param request - the {@link UserOperationCallData} to build and simulate asset changes for
   * @param blockNumber - (optional) the blockNumber to simulate the UO on. If not provided, simulation will be on latest block.
   * @returns the gas estimates for the given response (see: {@link UserOperationEstimateGasResponse})
   */
  simulateUserOperationExecution(
    request: UserOperationRequest
  ): Promise<SimulateExecutionResponse | SimulateExecutionResponse[]>;
};

export type AlchemyEnhanced4337Client<
  T extends SupportedTransports = Transport
> = Client<
  T,
  Chain,
  undefined,
  [...PublicRpcSchema, ...Erc4337RpcSchema, ...AlchemyEnhancedApiSchema],
  PublicActions<T, Chain> & Erc4337Actions & AlchemyEnhancedApiActions
>;
