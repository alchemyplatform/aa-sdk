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
import type { RequestGasAndPaymasterAndDataOverrides } from "../middleware/gasManager";

export type AlchemyRpcSchema<TEntryPointVersion extends EntryPointVersion> = [
  {
    Method: "alchemy_requestPaymasterAndData";
    Parameters: [
      {
        policyId: string;
        entryPoint: Address;
        userOperation: UserOperationRequest<TEntryPointVersion>;
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
        userOperation: UserOperationRequest<TEntryPointVersion>;
        dummySignature: Hex;
        overrides?: RequestGasAndPaymasterAndDataOverrides<TEntryPointVersion>;
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
    Parameters: SimulateUserOperationAssetChangesRequest<TEntryPointVersion>;
    ReturnType: SimulateUserOperationAssetChangesResponse;
  },
  {
    Method: "rundler_maxPriorityFeePerGas";
    Parameters: [];
    ReturnType: Hex;
  }
];

export type ClientWithAlchemyMethods<
  TEntryPointVersion extends EntryPointVersion
> = BundlerClient<TEntryPointVersion, HttpTransport> & {
  request: BundlerClient<TEntryPointVersion, HttpTransport>["request"] &
    {
      request(args: {
        method: "alchemy_requestPaymasterAndData";
        params: [
          {
            policyId: string;
            entryPoint: Address;
            userOperation: UserOperationRequest<TEntryPointVersion>;
          }
        ];
      }): Promise<{ paymasterAndData: Hex }>;

      request(args: {
        method: "alchemy_requestGasAndPaymasterAndData";
        params: [
          {
            policyId: string;
            entryPoint: Address;
            userOperation: UserOperationRequest<TEntryPointVersion>;
            dummySignature: Hex;
            overrides?: RequestGasAndPaymasterAndDataOverrides<TEntryPointVersion>;
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
        params: SimulateUserOperationAssetChangesRequest<TEntryPointVersion>;
      }): Promise<SimulateUserOperationAssetChangesResponse>;

      request(args: {
        method: "rundler_maxPriorityFeePerGas";
        params: [];
      }): Promise<Hex>;
    }["request"];
};
