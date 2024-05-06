import { type Hex, concat, pad } from "viem";
import type { Signature } from "../types.js";
import { formatSignatures } from "./formatSignatures.js";

export const combineSignatures = ({
  signatures,
  upperLimitMaxFeePerGas,
  upperLimitMaxPriorityFeePerGas,
  upperLimitPvg,
  usingMaxValues,
}: {
  upperLimitPvg: Hex;
  upperLimitMaxFeePerGas: Hex;
  upperLimitMaxPriorityFeePerGas: Hex;
  signatures: Signature[];
  usingMaxValues: boolean;
}) => {
  return concat([
    pad(upperLimitPvg),
    pad(upperLimitMaxFeePerGas),
    pad(upperLimitMaxPriorityFeePerGas),
    formatSignatures(signatures, usingMaxValues),
  ]);
};
