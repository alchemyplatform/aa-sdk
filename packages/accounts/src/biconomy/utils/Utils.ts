import {
  encodeAbiParameters,
  parseAbiParameters,
  keccak256,
  type Hex,
} from "viem";
import type { UserOperationStruct } from "@alchemy/aa-core";

/**
 * pack the userOperation
 * @param op
 * @param forSignature "true" if the hash is needed to calculate the getUserOpHash()
 *  "false" to pack entire UserOp, for calculating the calldata cost of putting it on-chain.
 */
export function packUserOp(
  op: Partial<UserOperationStruct>,
  forSignature = true
): string {
  if (!op.initCode || !op.callData || !op.paymasterAndData)
    throw new Error("Missing userOp properties");
  if (forSignature) {
    return encodeAbiParameters(
      parseAbiParameters(
        "address, uint256, bytes32, bytes32, uint256, uint256, uint256, uint256, uint256, bytes32"
      ),
      [
        op.sender as Hex,
        BigInt(op.nonce as Hex),
        keccak256(op.initCode as Hex),
        keccak256(op.callData as Hex),
        BigInt(op.callGasLimit as Hex),
        BigInt(op.verificationGasLimit as Hex),
        BigInt(op.preVerificationGas as Hex),
        BigInt(op.maxFeePerGas as Hex),
        BigInt(op.maxPriorityFeePerGas as Hex),
        keccak256(op.paymasterAndData as Hex),
      ]
    );
  } else {
    // for the purpose of calculating gas cost encode also signature (and no keccak of bytes)
    return encodeAbiParameters(
      parseAbiParameters(
        "address, uint256, bytes, bytes, uint256, uint256, uint256, uint256, uint256, bytes, bytes"
      ),
      [
        op.sender as Hex,
        BigInt(op.nonce as Hex),
        op.initCode as Hex,
        op.callData as Hex,
        BigInt(op.callGasLimit as Hex),
        BigInt(op.verificationGasLimit as Hex),
        BigInt(op.preVerificationGas as Hex),
        BigInt(op.maxFeePerGas as Hex),
        BigInt(op.maxPriorityFeePerGas as Hex),
        op.paymasterAndData as Hex,
        op.signature as Hex,
      ]
    );
  }
}

export const isNullOrUndefined = (value: any): value is undefined => {
  return value === null || value === undefined;
};
