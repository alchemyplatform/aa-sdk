import {
  type PublicErc4337Client,
  type UserOperationRequest,
} from "@alchemy/aa-core";
import type { Address, Hex, HttpTransport } from "viem";
import type {
  SimulateUserOperationAssetChangesRequest,
  SimulateUserOperationAssetChangesResponse,
} from "../actions/types";
import type { RequestGasAndPaymasterAndDataOverrides } from "../middleware/gasManager";

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
    ReturnType: { paymasterAndData: Hex };
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
    ReturnType: {
      paymasterAndData: Hex;
      callGasLimit: Hex;
      verificationGasLimit: Hex;
      preVerificationGas: Hex;
      maxFeePerGas: Hex;
      maxPriorityFeePerGas: Hex;
    };
  },
  {
    Method: "alchemy_simulateUserOperationAssetChanges";
    Parameters: SimulateUserOperationAssetChangesRequest;
    ReturnType: SimulateUserOperationAssetChangesResponse;
  },
  {
    Method: "rundler_maxPriorityFeePerGas";
    Parameters: [];
    ReturnType: Hex;
  }
];

export type ClientWithAlchemyMethods = PublicErc4337Client<HttpTransport> & {
  request: PublicErc4337Client["request"] &
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
      }): Promise<{ paymasterAndData: Hex }>;

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
      }): Promise<{
        paymasterAndData: Hex;
        callGasLimit: Hex;
        verificationGasLimit: Hex;
        preVerificationGas: Hex;
        maxFeePerGas: Hex;
        maxPriorityFeePerGas: Hex;
      }>;

      request(args: {
        method: "alchemy_simulateUserOperationAssetChanges";
        params: SimulateUserOperationAssetChangesRequest;
      }): Promise<SimulateUserOperationAssetChangesResponse>;

      request(args: {
        method: "rundler_maxPriorityFeePerGas";
        params: [];
      }): Promise<Hex>;
    }["request"];
};
