import { isHex, type Chain } from "viem";
import { z } from "zod";
import type { BigNumberish, Multiplier } from "../types";

export const ChainSchema = z.custom<Chain>(
  (chain) =>
    chain != null &&
    typeof chain === "object" &&
    "id" in chain &&
    typeof chain.id === "number"
);

export const HexSchema = z.custom<`0x${string}` | "0x">((val) => {
  return isHex(val, { strict: true });
});

// [!region BigNumberish]
export const BigNumberishSchema = z.union([HexSchema, z.number(), z.bigint()]);
// [!endregion BigNumberish]

// [!region BigNumberishRange]
export const BigNumberishRangeSchema = z
  .object({
    min: BigNumberishSchema.optional(),
    max: BigNumberishSchema.optional(),
  })
  .strict();
// [!endregion BigNumberishRange]

// [!region Multiplier]
export const MultiplierSchema = z
  .object({
    /**
     * Multiplier value with max precision of 4 decimal places
     */
    multiplier: z.number().refine(
      (n) => {
        return (n.toString().split(".")[1]?.length ?? 0) <= 4;
      },
      { message: "Max precision is 4 decimal places" }
    ),
  })
  .strict();
// [!endregion Multiplier]

export function isBigNumberish(x: any): x is BigNumberish {
  return x != null && BigNumberishSchema.safeParse(x).success;
}

export function isMultiplier(x: any): x is Multiplier {
  return x != null && MultiplierSchema.safeParse(x).success;
}
