// TODO(v5): need to update these to be exported from the correct packages
import { type Erc7677RpcSchema, type UserOperationRequest } from "@aa-sdk/core";

// TODO(v5): need to update these to be exported from the correct packages
import type {
  RequestGasAndPaymasterAndDataRequest,
  RequestGasAndPaymasterAndDataResponse,
  RequestPayamsterTokenQuoteRequest,
  RequestPayamsterTokenQuoteResponse,
  SimulateUserOperationAssetChangesRequest,
  SimulateUserOperationAssetChangesResponse,
} from "@account-kit/infra";

// TODO(v5): yea this definitely shouldn't live in common, but in aggregate in the alchemy-sdk package and combined with the schemas from other packages
export type AlchemyJsonRpcSchema = [
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
  {
    Method: "alchemy_requestPaymasterTokenQuote";
    Parameters: RequestPayamsterTokenQuoteRequest;
    ReturnType: RequestPayamsterTokenQuoteResponse;
  },
];
