import { MismatchingEntryPointError } from "../../errors/entrypoint.js";
import type { UserOperationOverrides, UserOperationStruct } from "../../types";
import type { ClientMiddlewareFn } from "../types";

export const overridePaymasterDataMiddleware: ClientMiddlewareFn = async (
  struct,
  { overrides, account }
) => {
  const entryPoint = account.getEntryPoint();
  if (
    overrides &&
    entryPoint.isUserOpVersion(struct) &&
    entryPoint.isUserOpVersion(overrides)
  ) {
    throw new MismatchingEntryPointError(entryPoint.version, overrides);
  }

  if (entryPoint.version === "0.6.0" && entryPoint.isUserOpVersion(struct)) {
    const _struct = struct as UserOperationStruct<"0.6.0">;
    _struct.paymasterAndData =
      _struct?.paymasterAndData != null ? _struct.paymasterAndData : "0x";
  } else {
    const _struct = struct as UserOperationStruct<"0.7.0">;
    const _overrides = overrides as UserOperationOverrides<"0.7.0">;

    _struct.paymaster =
      _overrides?.paymaster != null ? _overrides?.paymaster : "0x";
    _struct.paymasterData =
      _overrides?.paymasterData != null ? _overrides.paymasterData : "0x";
    _struct.paymasterPostOpGasLimit = _overrides?.paymasterPostOpGasLimit;
    _struct.paymasterVerificationGasLimit =
      _overrides?.paymasterVerificationGasLimit;
  }

  return struct;
};
