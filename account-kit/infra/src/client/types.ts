import {
  type BundlerClient,
  type Erc7677RpcSchema,
  type UserOperationRequest,
} from "@aa-sdk/core";
import type { Address, Hex } from "viem";
import type {
  RequestGasAndPaymasterAndDataRequest,
  RequestGasAndPaymasterAndDataResponse,
  RequestPayamsterTokenQuoteRequest,
  RequestPayamsterTokenQuoteResponse,
  SimulateUserOperationAssetChangesRequest,
  SimulateUserOperationAssetChangesResponse,
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
  {
    Method: "rundler_getPendingUserOperationBySenderNonce";
    Parameters: [Address, Hex];
    ReturnType: UserOperationRequest | null;
  },
  ...Erc7677RpcSchema<{ policyId: string }>,
  {
    Method: "alchemy_requestGasAndPaymasterAndData";
    Parameters: RequestGasAndPaymasterAndDataRequest;
    ReturnType: RequestGasAndPaymasterAndDataResponse;
  },
  {
    Method: "alchemy_requestPaymasterTokenQuote";
    Parameters: RequestPayamsterTokenQuoteRequest;
    ReturnType: RequestPayamsterTokenQuoteResponse;
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
