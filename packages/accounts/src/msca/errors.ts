import { BaseError } from "@alchemy/aa-core";

export class InvalidAggregatedSignatureError extends BaseError {
  override name = "InvalidAggregatedSignatureError";
  constructor() {
    super("Invalid aggregated signature");
  }
}

export class InvalidContextSignatureError extends BaseError {
  override name = "InvalidContextSignatureError";
  constructor() {
    super("Expected context.signature to be a hex string");
  }
}

export class MultisigAccountExpectedError extends BaseError {
  override name = "MultisigAccountExpectedError";
  constructor() {
    super("Expected account to be a multisig modular account");
  }
}

export class MultisigMissingSignatureError extends BaseError {
  override name = "MultisigMissingSignatureError";
  constructor() {
    super("UserOp must have at least one signature already");
  }
}
