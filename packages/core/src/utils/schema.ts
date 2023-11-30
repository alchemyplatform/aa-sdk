import { isHex, type Chain } from "viem";
import { z } from "zod";
import { getChain } from "./index.js";

export const ChainSchema = z.custom<Chain>((chain) => {
  if (
    chain == null ||
    !(typeof chain === "object") ||
    !("id" in chain) ||
    typeof chain.id !== "number"
  ) {
    return false;
  }

  try {
    return getChain(chain.id) !== undefined;
  } catch {
    return false;
  }
});

export const HexSchema = z.custom<`0x${string}` | "0x">((val) => {
  return isHex(val);
});

export const BigNumberishSchema = z.union([HexSchema, z.number(), z.bigint()]);

export const BigNumberishRangeSchema = z
  .object({
    min: BigNumberishSchema.optional(),
    max: BigNumberishSchema.optional(),
  })
  .strict();

export const PercentageSchema = z
  .object({
    /**
     * Percent value between 1 and 1000 inclusive
     */
    percentage: z.number().min(1).max(1000),
  })
  .strict();
