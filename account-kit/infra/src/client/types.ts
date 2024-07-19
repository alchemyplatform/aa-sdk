import { type BundlerClient, type UserOperationRequest } from "@aa-sdk/core";
import type { HttpTransport } from "viem";
import type {
  SimulateUserOperationAssetChangesRequest,
  SimulateUserOperationAssetChangesResponse,
} from "../actions/types";

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
  }
];

export type ClientWithAlchemyMethods = BundlerClient<HttpTransport> & {
  request: BundlerClient<HttpTransport>["request"] &
    {
      request(args: {
        method: "alchemy_simulateUserOperationAssetChanges";
        params: SimulateUserOperationAssetChangesRequest;
      }): Promise<SimulateUserOperationAssetChangesResponse>;

      request(args: {
        method: "rundler_maxPriorityFeePerGas";
        params: [];
      }): Promise<UserOperationRequest["maxPriorityFeePerGas"]>;
    }["request"];
} & {
  updateHeaders: (headers: HeadersInit) => void;
};
