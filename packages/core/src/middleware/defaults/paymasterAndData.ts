import type { UserOperationStruct } from "../../types";
import type { ClientMiddlewareFn } from "../types";

export const defaultPaymasterAndData: ClientMiddlewareFn = async (
  struct,
  { account }
) => {
  const entryPoint = account.getEntryPoint();
  if (entryPoint.version === "0.6.0") {
    (struct as UserOperationStruct<"0.6.0">).paymasterAndData = "0x";
  } else {
    // Make sure paymaster fields are unset
    delete (struct as UserOperationStruct<"0.7.0">).paymaster;
    delete (struct as UserOperationStruct<"0.7.0">).paymasterData;
    delete (struct as UserOperationStruct<"0.7.0">)
      .paymasterVerificationGasLimit;
    delete (struct as UserOperationStruct<"0.7.0">).paymasterPostOpGasLimit;
  }
  return struct;
};
