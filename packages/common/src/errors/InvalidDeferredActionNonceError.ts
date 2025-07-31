import { BaseError } from "./BaseError.js";

// TODO(jh): very specific errors should live in the sub-pkgs instead of in common.
/**
 * Error class denoting that the deferred action nonce used is invalid.
 */
export class InvalidDeferredActionNonceError extends BaseError {
  override name = "InvalidDeferredActionNonce";

  /**
   * Initializes a new instance of the error message with a default message indicating that the provided deferred action nonce is invalid.
   */
  constructor() {
    super(`The provided deferred action nonce is invalid`);
  }
}
