import {
  type BundlerClient,
  type EntryPointVersion,
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
        userOperation: UserOperationRequest<EntryPointVersion>;
      }
    ];
    ReturnType:
      | {
          paymasterAndData: UserOperationRequest<"0.6.0">["paymasterAndData"];
        }
      | Pick<
          UserOperationRequest<"0.7.0">,
          | "paymaster"
          | "paymasterData"
          | "paymasterPostOpGasLimit"
          | "paymasterVerificationGasLimit"
        >;
  },
  {
    Method: "alchemy_requestGasAndPaymasterAndData";
    Parameters: [
      {
        policyId: string;
        entryPoint: Address;
        userOperation: UserOperationRequest<EntryPointVersion>;
        dummySignature: Hex;
        overrides?: RequestGasAndPaymasterAndDataOverrides<EntryPointVersion>;
      }
    ];
    ReturnType: Pick<
      UserOperationRequest<EntryPointVersion>,
      | "callGasLimit"
      | "preVerificationGas"
      | "verificationGasLimit"
      | "maxFeePerGas"
      | "maxPriorityFeePerGas"
    > &
      (
        | {
            paymasterAndData: UserOperationRequest<"0.6.0">["paymasterAndData"];
          }
        | Pick<
            UserOperationRequest<"0.7.0">,
            | "paymaster"
            | "paymasterData"
            | "paymasterPostOpGasLimit"
            | "paymasterVerificationGasLimit"
          >
      );
  },
  {
    Method: "alchemy_simulateUserOperationAssetChanges";
    Parameters: SimulateUserOperationAssetChangesRequest;
    ReturnType: SimulateUserOperationAssetChangesResponse;
  },
  {
    Method: "rundler_maxPriorityFeePerGas";
    Parameters: [];
    ReturnType: UserOperationRequest<EntryPointVersion>["maxPriorityFeePerGas"];
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
            userOperation: UserOperationRequest<EntryPointVersion>;
          }
        ];
      }): Promise<RequestPaymasterAndDataResponse<EntryPointVersion>>;

      request(args: {
        method: "alchemy_requestGasAndPaymasterAndData";
        params: [
          {
            policyId: string;
            entryPoint: Address;
            userOperation: UserOperationRequest<EntryPointVersion>;
            dummySignature: Hex;
            overrides?: RequestGasAndPaymasterAndDataOverrides<EntryPointVersion>;
          }
        ];
      }): Promise<RequestGasAndPaymasterAndDataResponse<EntryPointVersion>>;

      request(args: {
        method: "alchemy_simulateUserOperationAssetChanges";
        params: SimulateUserOperationAssetChangesRequest;
      }): Promise<SimulateUserOperationAssetChangesResponse>;

      request(args: {
        method: "rundler_maxPriorityFeePerGas";
        params: [];
      }): Promise<
        UserOperationRequest<EntryPointVersion>["maxPriorityFeePerGas"]
      >;
    }["request"];
} & {
  updateHeaders: (headers: HeadersInit) => void;
};
