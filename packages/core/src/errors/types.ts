import { BaseError } from "./base.js";

export class InvalidContextSignatureError extends BaseError {
  override name = "InvalidContextSignatureError";
  constructor() {
    super("Expected context.signature to be a hex string");
  }
}
