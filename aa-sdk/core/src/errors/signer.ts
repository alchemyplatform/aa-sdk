import { BaseError } from "./base.js";

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
