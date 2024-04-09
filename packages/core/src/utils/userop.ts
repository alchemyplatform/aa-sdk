import type {
  BigNumberish,
  Multiplier,
  UserOperationFeeOptionsField,
  UserOperationRequest,
  UserOperationStruct,
} from "../types";
import { bigIntClamp, bigIntMultiply } from "./bigint.js";
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

/**
 * Applies a user operation override to a value
 *
 * @param value the value to apply the override to
 * @param override the override to apply
 * @returns the value with the override applied
 */
export function applyUserOpOverride(
  value: BigNumberish | undefined,
  override?: BigNumberish | Multiplier
): BigNumberish | undefined {
  if (override == null) {
    return value;
  }

  if (isBigNumberish(override)) {
    return override;
  }

  // multiplier override
  else {
    return value != null ? bigIntMultiply(value, override.multiplier) : value;
  }
}

/**
 * Applies a fee option override to a value
 *
 * @param value the value to override
 * @param feeOption the fee option to apply
 * @returns the value with the fee option applied
 */
export function applyUserOpFeeOption(
  value: BigNumberish | undefined,
  feeOption?: UserOperationFeeOptionsField
): BigNumberish {
  if (feeOption == null) {
    return value ?? 0n;
  }
  return value != null
    ? bigIntClamp(
        feeOption.multiplier
          ? bigIntMultiply(value, feeOption.multiplier)
          : value,
        feeOption.min,
        feeOption.max
      )
    : feeOption.min ?? 0n;
}

/**
 * Applies an override or fee option to a value
 *
 * @param value the value to override
 * @param override the override to apply
 * @param feeOption the fee option to apply
 * @returns the value with the override or fee option applied
 */
export function applyUserOpOverrideOrFeeOption(
  value: BigNumberish | undefined,
  override?: BigNumberish | Multiplier,
  feeOption?: UserOperationFeeOptionsField
): BigNumberish {
  return value != null && override != null
    ? applyUserOpOverride(value, override)!
    : applyUserOpFeeOption(value, feeOption);
}
