import { isHex, toHex, type Hex } from "viem";

export type Expect<T extends true> = T;

export const assertNever = (_val: never, msg: string): never => {
  throw new Error(msg);
};

/**
 * If the value is already Hex, it is returned unchanged. If it's a string, number or bigint, it's converted.
 *
 * @param {string | number | bigint | Hex} val - The value to convert to Hex.
 * @returns {Hex} The Hex value.
 *
 * @example
 * ```ts
 * const hex = castToHex("0x1234");
 * const hex2 = castToHex(1234);
 * const hex3 = castToHex(BigInt(1234));
 * ```
 */
export const castToHex = (val: string | number | bigint | Hex): Hex => {
  if (isHex(val)) {
    return val;
  }
  return toHex(val);
};
