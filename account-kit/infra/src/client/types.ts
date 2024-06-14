import {
  type BundlerClient,
  type UserOperationRequest,
} from "@alchemy/aa-core";
import type { Address, Hex, HttpTransport } from "viem";
import type {
  SimulateUserOperationAssetChangesRequest,
  SimulateUserOperationAssetChangesResponse,
} from "../actions/types";
import type {
  RequestGasAndPaymasterAndDataOverrides,
  RequestGasAndPaymasterAndDataResponse,
  RequestPaymasterAndDataResponse,
} from "../middleware/gasManager";

export type AlchemyRpcSchema = [
  {
    Method: "alchemy_requestPaymasterAndData";
    Parameters: [
      {
        policyId: string;
        entryPoint: Address;
        userOperation: UserOperationRequest;
      }
    ];
    ReturnType: RequestPaymasterAndDataResponse;
  },
  {
    Method: "alchemy_requestGasAndPaymasterAndData";
    Parameters: [
      {
        policyId: string;
        entryPoint: Address;
        userOperation: UserOperationRequest;
        dummySignature: Hex;
        overrides?: RequestGasAndPaymasterAndDataOverrides;
      }
    ];
    ReturnType: RequestGasAndPaymasterAndDataResponse;
  },
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
        method: "alchemy_requestPaymasterAndData";
        params: [
          {
            policyId: string;
            entryPoint: Address;
            userOperation: UserOperationRequest;
          }
        ];
      }): Promise<RequestPaymasterAndDataResponse>;

      request(args: {
        method: "alchemy_requestGasAndPaymasterAndData";
        params: [
          {
            policyId: string;
            entryPoint: Address;
            userOperation: UserOperationRequest;
            dummySignature: Hex;
            overrides?: RequestGasAndPaymasterAndDataOverrides;
          }
        ];
      }): Promise<RequestGasAndPaymasterAndDataResponse>;

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
