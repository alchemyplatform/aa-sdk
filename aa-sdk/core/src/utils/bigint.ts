import { keccak256, toHex } from "viem";
import type { BigNumberish, Multiplier } from "../types";
import { isMultiplier } from "./schema.js";

/**
 * Returns the max bigint in a list of bigints
 *
 * @param {bigint[]} args a list of bigints to get the max of
 * @returns {bigint} the max bigint in the list
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
 * @param {bigint[]} args a list of bigints to get the max of
 * @returns {bigint} the min bigint in the list
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
 * @param {BigNumberish} value a bigint value to clamp
 * @param {BigNumberish | undefined} lower lower bound min max tuple value
 * @param {BigNumberish | undefined} upper upper bound min max tuple value
 * @returns {bigint} the clamped bigint value per given range
 */
export const bigIntClamp = (
  value: BigNumberish,
  lower: BigNumberish | null | undefined,
  upper: BigNumberish | null | undefined,
): bigint => {
  lower = lower != null ? BigInt(lower) : null;
  upper = upper != null ? BigInt(upper) : null;

  if (upper != null && lower != null && upper < lower) {
    throw new Error(
      `invalid range: upper bound ${upper} is less than lower bound ${lower}`,
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
 * Given a bigint and a number (which can be a float), returns the bigint value.
 * Note: this function has loss and will round down to the nearest integer.
 *
 * @param {BigNumberish} base - the number to be multiplied
 * @param {number} multiplier - the amount to multiply by
 * @param {RoundingMode} roundingMode - the rounding mode to use when calculating the percent. defaults to ROUND_UP
 * @returns {bigint} the bigint value of the multiplication with the number rounded by the rounding mode
 */
export const bigIntMultiply = (
  base: BigNumberish,
  multiplier: Multiplier["multiplier"],
  roundingMode: RoundingMode = RoundingMode.ROUND_UP,
) => {
  if (!isMultiplier({ multiplier })) {
    throw new Error(
      "bigIntMultiply requires a multiplier validated number as the second argument",
    );
  }

  // Get decimal places of b. Max decimal places is defined by the MultiplerSchema.
  const decimalPlaces = multiplier.toString().split(".")[1]?.length ?? 0;
  const val =
    roundingMode === RoundingMode.ROUND_UP
      ? BigInt(base) * BigInt(Math.round(multiplier * 10 ** decimalPlaces)) +
        BigInt(10 ** decimalPlaces - 1)
      : BigInt(base) * BigInt(Math.round(multiplier * 10 ** decimalPlaces));

  return val / BigInt(10 ** decimalPlaces);
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
 * @param {string} phrase -- any string value.
 * @returns {bigint} the bigint value of the hashed string
 */
export const stringToIndex = (phrase: string): bigint =>
  BigInt(keccak256(toHex(phrase)));
