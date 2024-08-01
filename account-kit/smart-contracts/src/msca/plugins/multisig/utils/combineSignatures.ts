import { type Hex, concat, pad } from "viem";
import type { Signature } from "../types.js";
import { formatSignatures } from "./formatSignatures.js";

export type CombineSignaturesParams = {
  upperLimitPvg: Hex;
  upperLimitMaxFeePerGas: Hex;
  upperLimitMaxPriorityFeePerGas: Hex;
  signatures: Signature[];
  usingMaxValues: boolean;
};

/**
 * Combines multiple signatures with provided upper limit values for gas fees and returns the concatenated result.
 *
 * @example
 * ```ts
 * import { combineSignatures } from "@account-kit/smart-contracts";
 *
 * const combinedSignature = combineSignatures({
 *  // this is the upper limit pre-verification gas
 *  upperLimitPvg: "0x01",
 *  upperLimitMaxFeePerGas: "0x02",
 *  upperLimitMaxPriorityFeePerGas: "0x03",
 *  signatures: [{
 *    signerType: "EOA",
 *    userOpSigType: "UPPERLIMIT",
 *    signer: `0x...`,
 *    signature: `0x...`,
 *  }]
 *  usingMaxValues: false,
 * });
 * ```
 *
 * @param {CombineSignaturesParams} params The function parameters
 * @returns {Hex} The concatenated result of padding and formatting the provided values and signatures
 */
export function combineSignatures({
  signatures,
  upperLimitMaxFeePerGas,
  upperLimitMaxPriorityFeePerGas,
  upperLimitPvg,
  usingMaxValues,
}: CombineSignaturesParams): Hex {
  return concat([
    pad(upperLimitPvg),
    pad(upperLimitMaxFeePerGas),
    pad(upperLimitMaxPriorityFeePerGas),
    formatSignatures(signatures, usingMaxValues),
  ]);
}
