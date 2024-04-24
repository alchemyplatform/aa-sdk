import { BaseError } from "@alchemy/aa-core";

/**
 * Description
 *
 * Thrown from splitAggregatedSignature failure
 * to split the aggregated signature into its components with the given threshold
 *
 */
export class InvalidAggregatedSignatureError extends BaseError {
  /**
   * @inheritdoc
   */
  override name = "InvalidAggregatedSignatureError";
  /**
   * Creates an instance of InvalidAggregatedSignatureError.
   *
   */
  constructor() {
    super("Invalid aggregated signature");
  }
}

/**
 * Description
 *
 * Thrown when the multisigSignatureMiddleware is missing a valid context
 * with multisig signature to incrementally compose the aggregated signature
 *
 */
export class InvalidContextSignatureError extends BaseError {
  /**
   * @inheritdoc
   */
  override name = "InvalidContextSignatureError";
  /**
   * Creates an instance of InvalidContextSignatureError.
   *
   */
  constructor() {
    super("Expected context.signature to be a hex string");
  }
}

/**
 * Description
 *
 * Thrown when the multisigSignatureMiddleware is not called from the
 * context of multisig account connected smart account client
 *
 */
export class MultisigAccountExpectedError extends BaseError {
  /**
   * @inheritdoc
   */
  override name = "MultisigAccountExpectedError";
  /**
   * Creates an instance of MultisigAccountExpectedError.
   *
   */
  constructor() {
    super("Expected account to be a multisig modular account");
  }
}

/**
 * Description
 *
 * Thrown when the signMultisigUserOperation is called without the proposed and signed
 * signatures to compose into the final combined signature for the user operation
 *
 */
export class MultisigMissingSignatureError extends BaseError {
  /**
   * @inheritdoc
   */
  override name = "MultisigMissingSignatureError";
  /**
   * Creates an instance of MultisigMissingSignatureError.
   *
   */
  constructor() {
    super("UserOp must have at least one signature already");
  }
}
