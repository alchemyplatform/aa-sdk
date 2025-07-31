import { BaseError } from "./BaseError.js";

// TODO(jh): very specific errors should live in the sub-pkgs instead of in common.
/**
 * Error class denoting that the nonce key is invalid because its too large.
 */
export class InvalidNonceKeyError extends BaseError {
  override name = "InvalidNonceKeyError";

  /**
   * Initializes a new instance of the error message with a default message indicating that the nonce key is invalid.
   *
   * @param {bigint} nonceKey the invalid nonceKey used
   */
  constructor(nonceKey: bigint) {
    super(
      `Nonce key is ${nonceKey} but has to be less than or equal to 2**152`,
    );
  }
}
