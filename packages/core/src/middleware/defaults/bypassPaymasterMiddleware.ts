import type { UserOperationOverrides, UserOperationStruct } from "../../types";
import type { ClientMiddlewareFn } from "../types";

export const bypassPaymasterMiddleware: ClientMiddlewareFn = async (
  struct,
  { overrides = {}, account }
) => {
  // handle one-off overrides for bypassing paymaster middleware
  if (
    account.getEntryPoint().version === "0.6.0" &&
    (overrides as UserOperationOverrides<"0.6.0">)?.paymasterAndData === "0x"
  ) {
    return {
      ...struct,
      paymasterAndData: "0x",
    };
  } else if (
    account.getEntryPoint().version === "0.7.0" &&
    (overrides as UserOperationOverrides<"0.7.0">)?.paymasterData === "0x"
  ) {
    delete (struct as UserOperationStruct<"0.7.0">).paymaster;
    delete (struct as UserOperationStruct<"0.7.0">).paymasterData;
    delete (struct as UserOperationStruct<"0.7.0">)
      .paymasterVerificationGasLimit;
    delete (struct as UserOperationStruct<"0.7.0">).paymasterPostOpGasLimit;
    return struct;
  }
  return struct;
};
