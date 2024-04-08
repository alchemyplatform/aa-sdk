import type { UserOperationOverrides, UserOperationStruct } from "../../types";
import type { ClientMiddlewareFn } from "../types";

export const overridePaymasterDataMiddleware: ClientMiddlewareFn = async (
  struct,
  { overrides = {}, account }
) => {
  const entryPoint = account.getEntryPoint();

  switch (entryPoint.version) {
    case "0.6.0":
      (struct as UserOperationStruct<"0.6.0">).paymasterAndData =
        (overrides as UserOperationOverrides<"0.6.0">).paymasterAndData != null
          ? (overrides as UserOperationOverrides<"0.6.0">).paymasterAndData!
          : (struct as UserOperationStruct<"0.6.0">).paymasterAndData;
      break;
    case "0.7.0":
      const _overrides = overrides as UserOperationOverrides<"0.7.0">;
      // if paymaster is set, then all other paymaster fields must be set in the overrides
      if (_overrides.paymaster != null) {
        struct = {
          ...struct,
          paymaster: _overrides.paymaster,
          paymasterData: _overrides.paymasterData,
          paymasterPostOpGasLimit: _overrides.paymasterPostOpGasLimit,
          paymasterVerificationGasLimit:
            _overrides.paymasterVerificationGasLimit,
        };
      }
      break;
  }

  return struct;
};
