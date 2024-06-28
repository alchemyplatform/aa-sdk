import { BaseError } from "./base.js";

/**
 * Represents an error thrown when an invalid signer type is provided to the SmartAccountSigner.
 */
export class InvalidSignerTypeError extends BaseError {
  override name = "InvalidSignerTypeError";
  constructor(signerType?: string) {
    super(
      [
        "Invalid signer type parameter passed to SmartAccountSigner.",
        signerType ?? "A signerType must be provided.",
      ].join("\n")
    );
  }
}
