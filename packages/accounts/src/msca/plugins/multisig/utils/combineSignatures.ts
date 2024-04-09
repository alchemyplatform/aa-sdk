import { type Hex, concat, pad } from "viem";
import { formatSignatures } from "./formatSignatures.js";
import type { Signature } from "../types.js";

export const combineSignatures = ({
  signatures,
  upperLimitMaxFeePerGas,
  upperLimitMaxPriorityFeePerGas,
  upperLimitPvg,
}: {
  upperLimitPvg: Hex;
  upperLimitMaxFeePerGas: Hex;
  upperLimitMaxPriorityFeePerGas: Hex;
  signatures: Signature[];
}) => {
  return concat([
    pad(upperLimitPvg),
    pad(upperLimitMaxFeePerGas),
    pad(upperLimitMaxPriorityFeePerGas),
    formatSignatures(signatures),
  ]);
};
