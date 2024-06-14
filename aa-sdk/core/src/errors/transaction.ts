import type { Hex } from "viem";
import { BaseError } from "./base.js";

export class TransactionMissingToParamError extends BaseError {
  override name = "TransactionMissingToParamError";
  constructor() {
    super("Transaction is missing `to` address set on request");
  }
}

export class FailedToFindTransactionError extends BaseError {
  override name = "FailedToFindTransactionError";
  constructor(hash: Hex) {
    super(`Failed to find transaction for user operation ${hash}`);
  }
}
