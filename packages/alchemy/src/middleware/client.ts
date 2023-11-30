import {
  type PublicErc4337Client,
  type UserOperationRequest,
} from "@alchemy/aa-core";
import type { Address, Hex } from "viem";
import type {
  RequestGasAndPaymasterAndDataOverrides,
  SimulateUserOperationAssetChangesRequest,
  SimulateUserOperationAssetChangesResponse,
} from "./types/index.js";

export type ClientWithAlchemyMethods = PublicErc4337Client & {
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
