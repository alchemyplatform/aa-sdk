/**
 * BigNumberish represents values that can be converted to BigInt
 */
export type BigNumberish = string | number | bigint;

/**
 * Multiplier configuration for bigint multiplication
 */
export type Multiplier = {
  multiplier: number;
};

export enum RoundingMode {
  ROUND_DOWN = 0,
  ROUND_UP = 1,
}

/**
 * Validates if a multiplier has acceptable precision (max 4 decimal places)
 *
 * @param {Multiplier} multiplier - the multiplier to validate
 * @returns {boolean} true if valid, false otherwise
 */
function isValidMultiplier(multiplier: Multiplier): boolean {
  const decimalPlaces =
    multiplier.multiplier.toString().split(".")[1]?.length ?? 0;
  return decimalPlaces <= 4;
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
  if (!isValidMultiplier({ multiplier })) {
    throw new Error(
      "bigIntMultiply requires a multiplier validated number as the second argument (max 4 decimal places)",
    );
  }

  // Get decimal places of b. Max decimal places is defined by the validation above.
  const decimalPlaces = multiplier.toString().split(".")[1]?.length ?? 0;
  const result =
    BigInt(base) * BigInt(Math.round(multiplier * 10 ** decimalPlaces));
  return roundingMode === RoundingMode.ROUND_UP &&
    result % BigInt(10 ** decimalPlaces) > 0
    ? result / BigInt(10 ** decimalPlaces) + 1n
    : result / BigInt(10 ** decimalPlaces);
};
