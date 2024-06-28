import { BaseError } from "@aa-sdk/core";

/**
 * Error thrown when the aggregated signature is invalid
 */
export class InvalidAggregatedSignatureError extends BaseError {
  override name = "InvalidAggregatedSignatureError";

  /**
   * Initializes a new instance of the class with a predefined error message.
   */
  constructor() {
    super("Invalid aggregated signature");
  }
}

/**
 * Error thrown when the context signature is invalid
 */
export class InvalidContextSignatureError extends BaseError {
  override name = "InvalidContextSignatureError";

  /**
   * Initializes the error with the message "Expected context.signature to be a hex string".
   */ constructor() {
    super("Expected context.signature to be a hex string");
  }
}

/**
 * Error thrown when the expected account is not a multisig modular account
 */
export class MultisigAccountExpectedError extends BaseError {
  override name = "MultisigAccountExpectedError";
  /**
   * Constructs an error with the message "Expected account to be a multisig modular account".
   */ constructor() {
    super("Expected account to be a multisig modular account");
  }
}

/**
 * Error thrown when a multisig user op is missing a signature
 */
export class MultisigMissingSignatureError extends BaseError {
  override name = "MultisigMissingSignatureError";

  /**
   * Constructs an error indicating that a UserOp must have at least one signature already.
   */
  constructor() {
    super("UserOp must have at least one signature already");
  }
}
