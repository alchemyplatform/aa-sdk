import {
  type PublicErc4337Client,
  type UserOperationRequest,
} from "@alchemy/aa-core";
import type { Address, Hex } from "viem";

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
            feeOverride?: {
              maxFeePerGas: Hex;
              maxPriorityFeePerGas: Hex;
            };
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
        method: "rundler_maxPriorityFeePerGas";
        params: [];
      }): Promise<Hex>;
    }["request"];
};
