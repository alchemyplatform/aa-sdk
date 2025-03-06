import {
  type BundlerClient,
  type Erc7677RpcSchema,
  type UserOperationRequest,
} from "@aa-sdk/core";
import type {
  SimulateUserOperationAssetChangesRequest,
  SimulateUserOperationAssetChangesResponse,
  RequestGasAndPaymasterAndDataRequest,
  RequestGasAndPaymasterAndDataResponse,
} from "../actions/types";
import type { AlchemyTransport } from "../alchemyTransport";

export type AlchemyRpcSchema = [
  {
    Method: "alchemy_simulateUserOperationAssetChanges";
    Parameters: SimulateUserOperationAssetChangesRequest;
    ReturnType: SimulateUserOperationAssetChangesResponse;
  },
  {
    Method: "rundler_maxPriorityFeePerGas";
    Parameters: [];
    ReturnType: UserOperationRequest["maxPriorityFeePerGas"];
  },
  ...Erc7677RpcSchema<{ policyId: string }>,
  {
    Method: "alchemy_requestGasAndPaymasterAndData";
    Parameters: RequestGasAndPaymasterAndDataRequest;
    ReturnType: RequestGasAndPaymasterAndDataResponse;
  },
];

export type ClientWithAlchemyMethods = BundlerClient<AlchemyTransport> & {
  request: BundlerClient<AlchemyTransport>["request"] &
    {
      request(args: {
        method: "alchemy_simulateUserOperationAssetChanges";
        params: SimulateUserOperationAssetChangesRequest;
      }): Promise<SimulateUserOperationAssetChangesResponse>;

      request(args: {
        method: "rundler_maxPriorityFeePerGas";
        params: [];
      }): Promise<UserOperationRequest["maxPriorityFeePerGas"]>;

      request(args: {
        method: "alchemy_requestGasAndPaymasterAndData";
        params: RequestGasAndPaymasterAndDataRequest;
      }): Promise<RequestGasAndPaymasterAndDataResponse>;
    }["request"];
};
