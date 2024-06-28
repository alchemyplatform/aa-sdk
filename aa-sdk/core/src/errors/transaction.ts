import type { Hex } from "viem";
import { BaseError } from "./base.js";

/**
 * Error thrown when a transaction is missing the `to` address parameter. This class extends the `BaseError` class.
 */
export class TransactionMissingToParamError extends BaseError {
  override name = "TransactionMissingToParamError";

  /**
   * Throws an error indicating that a transaction is missing the `to` address.
   */
  constructor() {
    super("Transaction is missing `to` address set on request");
  }
}

/**
 * Represents an error that occurs when a transaction cannot be found for a given user operation. This error extends from `BaseError`. The `hash` of the transaction is provided to indicate which transaction could not be found.
 */
export class FailedToFindTransactionError extends BaseError {
  override name = "FailedToFindTransactionError";

  /**
   * Creates an error indicating a failed attempt to find a transaction for the specified user operation.
   *
   * @param {Hex} hash the hash representing the user operation
   */
  constructor(hash: Hex) {
    super(`Failed to find transaction for user operation ${hash}`);
  }
}
