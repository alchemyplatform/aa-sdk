import type {
  BigNumberish,
  Percentage,
  UserOperationFeeOptionsField,
  UserOperationRequest,
  UserOperationStruct,
} from "../types";
import { bigIntClamp, bigIntPercent } from "./bigint.js";
import { isBigNumberish } from "./index.js";

/**
 * Utility method for asserting a {@link UserOperationStruct} is a {@link UserOperationRequest}
 *
 * @param request a {@link UserOperationStruct} to validate
 * @returns a type guard that asserts the {@link UserOperationStruct} is a {@link UserOperationRequest}
 */
export function isValidRequest(
  request: UserOperationStruct
): request is UserOperationRequest {
  // These are the only ones marked as optional in the interface above
  return (
    !!request.callGasLimit &&
    !!request.maxFeePerGas &&
    request.maxPriorityFeePerGas != null &&
    !!request.preVerificationGas &&
    !!request.verificationGasLimit
  );
}

export function applyUserOpOverride(
  value: BigNumberish | undefined,
  override?: BigNumberish | Percentage
): BigNumberish | undefined {
  if (override == null) {
    return value;
  }

  if (isBigNumberish(override)) {
    return override;
  }

  // percentage override
  else {
    return value != null
      ? bigIntPercent(value, BigInt(100 + override.percentage))
      : value;
  }
}

export function applyUserOpFeeOption(
  value: BigNumberish | undefined,
  feeOption?: UserOperationFeeOptionsField
): BigNumberish {
  if (feeOption == null) {
    return value ?? 0n;
  }
  return value != null
    ? bigIntClamp(
        feeOption.percentage
          ? bigIntPercent(value, BigInt(100 + feeOption.percentage))
          : value,
        feeOption.min,
        feeOption.max
      )
    : feeOption.min ?? 0n;
}

export function applyUserOpOverrideOrFeeOption(
  value: BigNumberish | undefined,
  override?: BigNumberish | Percentage,
  feeOption?: UserOperationFeeOptionsField
): BigNumberish {
  return value != null && override != null
    ? applyUserOpOverride(value, override)!
    : applyUserOpFeeOption(value, feeOption);
}
