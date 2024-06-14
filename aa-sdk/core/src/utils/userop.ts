import { concat, type Address, type Hex } from "viem";
import type { EntryPointVersion } from "../entrypoint/types";
import type {
  BigNumberish,
  Multiplier,
  UserOperationFeeOptionsField,
  UserOperationOverrides,
  UserOperationRequest,
  UserOperationStruct,
  UserOperationStruct_v6,
  UserOperationStruct_v7,
} from "../types";
import { bigIntClamp, bigIntMultiply } from "./bigint.js";
import { allEqual, isBigNumberish } from "./index.js";

/**
 * Utility method for asserting a {@link UserOperationStruct} has valid fields for the given entry point version
 *
 * @param request a {@link UserOperationStruct} to validate
 * @returns a type guard that asserts the {@link UserOperationRequest} is valid
 */
export function isValidRequest<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
>(
  request: UserOperationStruct<TEntryPointVersion>
): request is UserOperationRequest<TEntryPointVersion> {
  // These are the only ones marked as optional in the interface above
  return (
    BigInt(request.callGasLimit || 0n) > 0n &&
    BigInt(request.maxFeePerGas || 0n) > 0n &&
    BigInt(request.preVerificationGas || 0n) > 0n &&
    BigInt(request.verificationGasLimit || 0n) > 0n &&
    request.maxPriorityFeePerGas != null &&
    isValidPaymasterAndData(request) &&
    isValidFactoryAndData(request)
  );
}

/**
 * Utility method for asserting a {@link UserOperationRequest} has valid fields for the paymaster data
 *
 * @param request a {@link UserOperationRequest} to validate
 * @returns a type guard that asserts the {@link UserOperationRequest} is a {@link UserOperationRequest}
 */
export function isValidPaymasterAndData<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
>(request: UserOperationStruct<TEntryPointVersion>): boolean {
  if ("paymasterAndData" in request) {
    return (request as UserOperationStruct_v6).paymasterAndData != null;
  }

  // either all exist, or none.
  return allEqual(
    (request as UserOperationStruct_v7).paymaster == null,
    (request as UserOperationStruct_v7).paymasterData == null,
    (request as UserOperationStruct_v7).paymasterPostOpGasLimit == null,
    (request as UserOperationStruct_v7).paymasterVerificationGasLimit == null
  );
}

/**
 * Utility method for asserting a {@link UserOperationStruct} has valid fields for the paymaster data
 *
 * @param request a {@link UserOperationRequest} to validate
 * @returns a type guard that asserts the {@link UserOperationStruct} is a {@link UserOperationRequest}
 */
export function isValidFactoryAndData<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
>(request: UserOperationStruct<TEntryPointVersion>): boolean {
  if ("initCode" in request) {
    const { initCode } = request as UserOperationStruct_v6;
    return initCode != null;
  }

  // either all exist, or none.
  return allEqual(
    (request as UserOperationStruct_v7).factory == null,
    (request as UserOperationStruct_v7).factoryData == null
  );
}

/**
 * Utility method for applying a {@link UserOperationOverrides} field value
 * over the current value set for the field
 *
 * @param value the current value of the field
 * @param override the override value to apply
 * @returns the new value of the field after applying the override
 */
export function applyUserOpOverride<TValue extends BigNumberish | undefined>(
  value: TValue,
  override?: BigNumberish | Multiplier
): TValue | BigNumberish {
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
 * Utility method for applying a {@link UserOperationFeeOptionsField} value
 * over the current value set for the field
 *
 * @param value the current value of the field
 * @param feeOption the fee option field value to apply
 * @returns the new value of the field after applying the fee option
 */
export function applyUserOpFeeOption<TValue extends BigNumberish | undefined>(
  value: TValue,
  feeOption?: UserOperationFeeOptionsField
): TValue | BigNumberish {
  if (feeOption == null) {
    return value;
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
 * Utility method for applying a {@link UserOperationOverrides} field value and
 * a {@link UserOperationFeeOptionsField} value over the current value set for the field,
 * with the override taking precedence over the fee option
 *
 * @param value the current value of the field
 * @param [override] the override value to apply
 * @param [feeOption] the fee option field value to apply
 * @returns the new value of the field after applying the override or fee option
 */
export function applyUserOpOverrideOrFeeOption<
  TValue extends BigNumberish | undefined
>(
  value: TValue,
  override?: BigNumberish | Multiplier,
  feeOption?: UserOperationFeeOptionsField
): TValue | BigNumberish {
  return value != null && override != null
    ? applyUserOpOverride(value, override)!
    : applyUserOpFeeOption(value, feeOption);
}

/**
 * Utility method for checking whether the middleware pipeline should
 * bypass the paymaster middleware for the user operation with the given overrides,
 * either because the UserOp is paying for its own gas, or passing a specific paymaster
 *
 * @template EntryPointVersion TEntryPointVersion
 * @param overrides the user operation overrides to check
 * @returns whether the paymaster middleware should be bypassed
 */
export const bypassPaymasterAndData = <
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
>(
  overrides: UserOperationOverrides<TEntryPointVersion> | undefined
): boolean =>
  !!overrides &&
  ("paymasterAndData" in overrides || "paymasterData" in overrides);

/**
 * An alternative to `bypassPaymasterAndData` which only returns true if the data parameter
 * is "0x," this is useful for cases when middleware should be bypassed ONLY IF the UserOp will
 * pay for its own gas
 *
 * @template EntryPointVersion TEntryPointVersion
 * @param overrides the user operation overrides to check
 * @returns whether the paymaster middleware should be bypassed
 */
export const bypassPaymasterAndDataEmptyHex = <
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
>(
  overrides: UserOperationOverrides<TEntryPointVersion> | undefined
): boolean =>
  overrides !== undefined &&
  (("paymasterAndData" in overrides && overrides.paymasterAndData === "0x") ||
    ("paymasterData" in overrides && overrides.paymasterData === "0x"));

/**
 * Utility method for parsing the paymaster address and paymasterData from the paymasterAndData hex string
 *
 * @param paymasterAndData the paymaster and data hex string to parse.
 *                         The hex string refers to the paymasterAndData field of entrypoint v0.6 user operation request
 * @returns the parsed paymaster and paymasterData fields of entrypoint v0.7 user operation request paymaster and paymasterData field
 */
export const parsePaymasterAndData = (
  paymasterAndData: Hex
): Pick<UserOperationRequest<"0.7.0">, "paymaster" | "paymasterData"> => ({
  paymaster: paymasterAndData.substring(0, 42) as Address,
  paymasterData: `0x${paymasterAndData.substring(42)}` as Hex,
});

/**
 * Utility method for converting the object containing the paymaster address and paymaster data
 * to the paymaster and data concatenated hex string
 *
 * @param paymasterAndData the object containing the picked paymaster and paymasterData fields of
 *                         entrypoint v0.7 user operation request
 * @param paymasterAndData.paymaster the paymaster address
 * @param paymasterAndData.paymasterData the paymaster data
 * @returns the paymasterAndData hex value of entrypoint v0.6 user operation request paymasterAndData field
 */
export const concatPaymasterAndData = ({
  paymaster = "0x",
  paymasterData = "0x",
}: Pick<UserOperationRequest<"0.7.0">, "paymaster" | "paymasterData">): Hex =>
  concat([paymaster, paymasterData]);
