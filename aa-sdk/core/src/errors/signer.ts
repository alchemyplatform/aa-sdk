import { BaseError } from "./base.js";

/**
 * Represents an error thrown when an invalid signer type is provided to the SmartAccountSigner.
 */
export class InvalidSignerTypeError extends BaseError {
  override name = "InvalidSignerTypeError";

  /**
   * Constructs an error message when an invalid signer type is passed to SmartAccountSigner.
   *
   * @param {string} [signerType] An optional parameter specifying the signer type. If not provided, a default error message will be used.
   */
  constructor(signerType?: string) {
    super(
      [
        "Invalid signer type parameter passed to SmartAccountSigner.",
        signerType ?? "A signerType must be provided.",
      ].join("\n")
    );
  }
}
