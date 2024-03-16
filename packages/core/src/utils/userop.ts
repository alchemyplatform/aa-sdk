import type { Address } from "abitype";
import {
  concat,
  encodeAbiParameters,
  hexToBigInt,
  isAddress,
  keccak256,
  pad,
  toHex,
  type Hash,
  type Hex,
} from "viem";
import type { EntryPointVersion } from "../entrypoint/types";
import type {
  BigNumberish,
  Multiplier,
  UserOperationFeeOptionsField,
  UserOperationRequest,
  UserOperationRequest_v7,
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
export function isValidRequest<
  TEntryPointVersion extends EntryPointVersion | undefined =
    | EntryPointVersion
    | undefined
>(
  request: UserOperationStruct<TEntryPointVersion>
): request is UserOperationRequest<TEntryPointVersion> {
  // These are the only ones marked as optional in the interface above
  return (
    BigInt(request.callGasLimit || 0n) > 0n &&
    BigInt(request.maxFeePerGas || 0n) > 0n &&
    BigInt(request.maxPriorityFeePerGas || 0n) > 0n &&
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
  TEntryPointVersion extends EntryPointVersion | undefined =
    | EntryPointVersion
    | undefined
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
  TEntryPointVersion extends EntryPointVersion | undefined =
    | EntryPointVersion
    | undefined
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

/**
 * Generates a hash for a UserOperation valid from entry point version 0.6 onwards
 *
 * @param request - the UserOperation to get the hash for
 * @param entryPointAddress - the entry point address that will be used to execute the UserOperation
 * @param entryPointVersion - a {@link EntryPointVersion} entry point contract version
 * @param chainId - the chain on which this UserOperation will be executed
 * @returns the hash of the UserOperation
 */
export function getUserOperationHash<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
>(
  request: UserOperationRequest<TEntryPointVersion>,
  entryPointAddress: Address,
  chainId: number
): Hash {
  const encoded = encodeAbiParameters(
    [{ type: "bytes32" }, { type: "address" }, { type: "uint256" }],
    [
      keccak256(packUserOperation<TEntryPointVersion>(request)),
      entryPointAddress,
      BigInt(chainId),
    ]
  ) as `0x${string}`;

  return keccak256(encoded);
}

/**
 * Pack the user operation data into bytes for hashing for entry point version 0.6 onwards
 * Reference:
 * v0.6.0: https://github.com/eth-infinitism/account-abstraction/blob/releases/v0.6/test/UserOp.ts#L16-L61
 * v0.7.0: https://github.com/eth-infinitism/account-abstraction/blob/releases/v0.7/test/UserOp.ts#L28-L67
 *
 * @param request - the UserOperation to get the hash for
 * @returns the hash of the UserOperation
 */
export function packUserOperation<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
>(request: UserOperationRequest<TEntryPointVersion>): Hex {
  switch ("paymaster" in request ? "0.7.0" : "0.6.0") {
    case "0.7.0":
      const initCode = concat([
        (request as UserOperationRequest_v7).factory,
        (request as UserOperationRequest_v7).factoryData,
      ]);
      const accountGasLimits = packAccountGasLimits(
        (({ verificationGasLimit, callGasLimit }) => ({
          verificationGasLimit,
          callGasLimit,
        }))(request as UserOperationRequest<"0.7.0">)
      );

      const gasFees = packAccountGasLimits(
        (({ maxPriorityFeePerGas, maxFeePerGas }) => ({
          maxPriorityFeePerGas,
          maxFeePerGas,
        }))(request as UserOperationRequest<"0.7.0">)
      );

      const paymasterAndData = isAddress(
        (request as UserOperationRequest<"0.7.0">).paymaster
      )
        ? packPaymasterData(
            (({
              paymaster,
              paymasterVerificationGasLimit,
              paymasterPostOpGasLimit,
              paymasterData,
            }) => ({
              paymaster,
              paymasterVerificationGasLimit,
              paymasterPostOpGasLimit,
              paymasterData,
            }))(request as UserOperationRequest<"0.7.0">)
          )
        : "0x";

      return encodeAbiParameters(
        [
          { type: "address" },
          { type: "uint256" },
          { type: "bytes32" },
          { type: "bytes32" },
          { type: "bytes32" },
          { type: "uint256" },
          { type: "bytes32" },
          { type: "bytes32" },
        ],
        [
          request.sender as Address,
          hexToBigInt(request.nonce),
          keccak256(initCode),
          keccak256(request.callData),
          accountGasLimits,
          hexToBigInt(request.preVerificationGas),
          gasFees,
          paymasterAndData,
        ]
      );

    case "0.6.0":
    default:
      const hashedInitCode = keccak256(
        (request as UserOperationRequest<"0.6.0">).initCode
      );
      const hashedCallData = keccak256(request.callData);
      const hashedPaymasterAndData = keccak256(
        (request as UserOperationRequest<"0.6.0">).paymasterAndData
      );

      return encodeAbiParameters(
        [
          { type: "address" },
          { type: "uint256" },
          { type: "bytes32" },
          { type: "bytes32" },
          { type: "uint256" },
          { type: "uint256" },
          { type: "uint256" },
          { type: "uint256" },
          { type: "uint256" },
          { type: "bytes32" },
        ],
        [
          request.sender as Address,
          hexToBigInt(request.nonce),
          hashedInitCode,
          hashedCallData,
          hexToBigInt(request.callGasLimit),
          hexToBigInt(request.verificationGasLimit),
          hexToBigInt(request.preVerificationGas),
          hexToBigInt(request.maxFeePerGas),
          hexToBigInt(request.maxPriorityFeePerGas),
          hashedPaymasterAndData,
        ]
      );
  }
}

export function packAccountGasLimits(
  data:
    | Pick<UserOperationRequest_v7, "verificationGasLimit" | "callGasLimit">
    | Pick<UserOperationRequest_v7, "maxPriorityFeePerGas" | "maxFeePerGas">
): Hex {
  return concat(Object.values(data).map((v) => pad(v, { size: 16 })));
}

export function packPaymasterData({
  paymaster,
  paymasterVerificationGasLimit,
  paymasterPostOpGasLimit,
  paymasterData,
}: Pick<
  UserOperationRequest_v7,
  | "paymaster"
  | "paymasterVerificationGasLimit"
  | "paymasterPostOpGasLimit"
  | "paymasterData"
>): Hex {
  return concat([
    paymaster,
    pad(paymasterVerificationGasLimit, { size: 16 }),
    pad(paymasterPostOpGasLimit, { size: 16 }),
    paymasterData,
  ]);
}

export function unpackAccountGasLimits(accountGasLimits: string): {
  verificationGasLimit: number;
  callGasLimit: number;
} {
  return {
    verificationGasLimit: parseInt(accountGasLimits.slice(2, 34), 16),
    callGasLimit: parseInt(accountGasLimits.slice(34), 16),
  };
}
