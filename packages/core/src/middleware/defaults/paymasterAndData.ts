import type { UserOperationOverrides, UserOperationStruct } from "../../types";
import type { ClientMiddlewareFn } from "../types";

export const defaultPaymasterAndData: ClientMiddlewareFn = async (
  struct,
  { account, overrides }
) => {
  const entryPoint = account.getEntryPoint();
  if (entryPoint.version === "0.6.0") {
    (struct as UserOperationStruct<"0.6.0">).paymasterAndData =
      (overrides as UserOperationOverrides<"0.6.0">)?.paymasterAndData ?? "0x";
  } else {
    // Remove paymasterVerificationGasLimit field from uo struct
    // filled during the `eth_estimateUserOperationGas` call from the default gasEstimator
    delete (struct as UserOperationStruct<"0.7.0">)
      .paymasterVerificationGasLimit;
  }
  return struct;
};
