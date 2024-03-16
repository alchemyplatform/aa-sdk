import { isAddress, toHex } from "viem";
import type { EntryPointVersion } from "../entrypoint/types";
import type {
  BigNumberish,
  Multiplier,
  UserOperationFeeOptionsField,
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
 * @param entryPointVersion a {@link EntryPointVersion} entry point version
 * @returns a type guard that asserts the {@link UserOperationRequest} is valid
 */
export function isValidRequest<TEntryPointVersion extends EntryPointVersion>(
  request: UserOperationStruct<TEntryPointVersion>
): request is UserOperationRequest<TEntryPointVersion> {
  // These are the only ones marked as optional in the interface above
  return (
    BigInt(request.callGasLimit || 0n) > 0n &&
    BigInt(request.maxFeePerGas || 0n) > 0n &&
    BigInt(request.preVerificationGas || 0n) > 0n &&
    BigInt(request.verificationGasLimit || 0n) > 0n &&
    isValidPaymasterAndData(request) &&
    isValidFactoryAndData(request)
  );
}

/**
 * Utility method for asserting a {@link UserOperationRequest} has valid fields for the paymaster data
 *
 * @param request a {@link UserOperationRequest} to validate
 * @param entryPointVersion a {@link EntryPointVersion} entry point version
 * @returns a type guard that asserts the {@link UserOperationRequest} is a {@link UserOperationRequest}
 */
export function isValidPaymasterAndData<
  TEntryPointVersion extends EntryPointVersion
>(request: UserOperationStruct<TEntryPointVersion>): boolean {
  if (!("paymaster" in request)) {
    const { paymasterAndData } = request as UserOperationStruct_v6;
    return paymasterAndData != null;
  }

  const {
    paymaster,
    paymasterData,
    paymasterPostOpGasLimit,
    paymasterVerificationGasLimit,
  } = request as UserOperationStruct_v7;
  // either all exist, or none.
  return allEqual(
    isAddress(paymaster),
    toHex(paymasterData || "0x") !== "0x",
    BigInt(paymasterPostOpGasLimit || 0n) > 0n,
    BigInt(paymasterVerificationGasLimit || 0n) > 0n
  );
}

/**
 * Utility method for asserting a {@link UserOperationStruct} has valid fields for the paymaster data
 *
 * @param request a {@link UserOperationRequest} to validate
 * @param entryPointVersion a {@link EntryPointVersion} entry point version
 * @returns a type guard that asserts the {@link UserOperationStruct} is a {@link UserOperationRequest}
 */
export function isValidFactoryAndData<
  TEntryPointVersion extends EntryPointVersion
>(request: UserOperationStruct<TEntryPointVersion>): boolean {
  if (!("factory" in request)) {
    const { initCode } = request as UserOperationStruct_v6;
    return initCode != null;
  }

  const { factory, factoryData } = request as UserOperationStruct_v7;
  // either all exist, or none.
  return allEqual(isAddress(factory), toHex(factoryData || "0x") !== "0x");
}

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

export function applyUserOpOverrideOrFeeOption(
  value: BigNumberish | undefined,
  override?: BigNumberish | Multiplier,
  feeOption?: UserOperationFeeOptionsField
): BigNumberish {
  return value != null && override != null
    ? applyUserOpOverride(value, override)!
    : applyUserOpFeeOption(value, feeOption);
}
