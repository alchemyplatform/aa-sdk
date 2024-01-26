import { keccak256, toHex } from "viem";
import type { BigNumberish } from "../types";

/**
 * Returns the max bigint in a list of bigints
 *
 * @param args a list of bigints to get the max of
 * @returns the max bigint in the list
 */
export const bigIntMax = (...args: bigint[]): bigint => {
  if (!args.length) {
    throw new Error("bigIntMax requires at least one argument");
  }

  return args.reduce((m, c) => (m > c ? m : c));
};

/**
 * Returns the min bigint in a list of bigints
 *
 * @param args a list of bigints to get the max of
 * @returns the min bigint in the list
 */
export const bigIntMin = (...args: bigint[]): bigint => {
  if (!args.length) {
    throw new Error("bigIntMin requires at least one argument");
  }

  return args.reduce((m, c) => (m < c ? m : c));
};

/**
 * Given a bigint and a min-max range, returns the min-max clamped bigint value
 *
 * @param value a bigint value to clamp
 * @param lower lower bound min max tuple value
 * @param upper upper bound min max tuple value
 * @returns the clamped bigint value per given range
 */
export const bigIntClamp = (
  value: BigNumberish,
  lower: BigNumberish | null | undefined,
  upper: BigNumberish | null | undefined
) => {
  lower = lower != null ? BigInt(lower) : null;
  upper = upper != null ? BigInt(upper) : null;

  if (upper != null && lower != null && upper < lower) {
    throw new Error(
      `invalid range: upper bound ${upper} is less than lower bound ${lower}`
    );
  }

  let ret = BigInt(value);
  if (lower != null && lower > ret) {
    ret = lower;
  }
  if (upper != null && upper < ret) {
    ret = upper;
  }
  return ret;
};

export enum RoundingMode {
  ROUND_DOWN = 0,
  ROUND_UP = 1,
}

/**
 * Useful if you want to increment a bigint by N% or decrement by N%
 *
 * example:
 * ```
 * const tenPercentIncrease = bigIntPercent(100n, 110n);
 * const tenPercentDecrease = bigIntPercent(100n, 90n);
 * ```
 *
 * @param base -- the base bigint that we want to apply a percent to
 * @param percent -- the percent to apply to the base
 * @param roundingMode -- the rounding mode to use when calculating the percent. defaults to ROUND_UP
 * @returns the base multiplied by the percent and divided by 100
 */
export const bigIntPercent = (
  base: BigNumberish,
  percent: bigint,
  roundingMode: RoundingMode = RoundingMode.ROUND_UP
) => {
  if (roundingMode === RoundingMode.ROUND_UP) {
    return (BigInt(base) * percent + 99n) / 100n;
  }

  return (BigInt(base) * percent) / 100n;
};

/**
 * Useful if you want to use a string, such as a user's email address, as salt to generate a unique SmartAccount per user.
 *
 * example:
 * ```
 * const salt = stringToIndex("alice@example.com");
 *
 * export const account = new SimpleSmartContractAccount({
 *   index: salt,
 *   // other args omitted...
 * });
 * ```
 *
 * @param phrase -- any string value.
 * @returns the bigint value of the hashed string
 */
export const stringToIndex = (phrase: string): bigint =>
  BigInt(keccak256(toHex(phrase)));
