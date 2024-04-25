import type { UserOperationOverrides, UserOperationStruct } from "../../types";
import type { ClientMiddlewareFn } from "../types";

/**
 * Middleware for bypassing paymaster middleware.
 * Specifically, this middleware is not the same as the {@link noopMiddleware} as this middleware
 * ensures that for Entrypoint v0.7 user operations, all 4 paymaster fields are omitted
 * even when paymaster is configured on the {@link SmartAccountClient}.
 *
 * @param struct the user operation struct to apply the middleware to
 * @param param the additional parameters per context of the client and the user operation
 * @param param.overrides the user operation overrides to apply during the middleware run
 * @param param.account the smart contract account to send the user operation for
 * @returns the user operation struct with paymaster middleware bypassed
 */
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

  // essentially, no op but should not reach here
  return struct;
};
