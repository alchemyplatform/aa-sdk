import type { Percentage, UserOperationRequest } from "@alchemy/aa-core";

export type * from "./simulate-uo/index.js";

export type RequestGasAndPaymasterAndDataOverrides = Partial<{
  maxFeePerGas: UserOperationRequest["maxFeePerGas"] | Percentage;
  maxPriorityFeePerGas: UserOperationRequest["maxFeePerGas"] | Percentage;
  callGasLimit: UserOperationRequest["maxFeePerGas"] | Percentage;
  preVerificationGas: UserOperationRequest["maxFeePerGas"] | Percentage;
  verificationGasLimit: UserOperationRequest["maxFeePerGas"] | Percentage;
}>;
