import type { UserOperationRequest, UserOperationStruct } from "../types.js";
import { BaseError } from "./base.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars

/**
 * Thrown when a UserOperationStruct is not a valid request
 *
 * extends viem BaseError
 */
export class InvalidUserOperationError extends BaseError {
  /**
   * @inheritdoc
   */
  override name = "InvalidUserOperationError";
  /**
   * Creates an instance of InvalidUserOperationError.
   *
   * InvalidUserOperationError constructor
   *
   * @param {UserOperationStruct} uo the invalid user operation struct
   */
  constructor(uo: UserOperationStruct) {
    super(
      `Request is missing parameters. All properties on UserOperationStruct must be set. uo: ${JSON.stringify(
        uo,
        (_key, value) =>
          typeof value === "bigint"
            ? {
                type: "bigint",
                value: value.toString(),
              }
            : value,
        2
      )}`
    );
  }
}

/**
 * Error thrown when waiting for user operation request to be mined.
 *
 * Includes the internal error as well as the request that failed. This request
 * can then be used with dropAndReplaceUserOperation to retry the operation.
 */
export class WaitForUserOperationError extends BaseError {
  /**
   * @param {UserOperationRequest} request the user operation request that failed
   * @param {Error} error the underlying error that caused the failure
   */
  constructor(public request: UserOperationRequest, error: Error) {
    super(`Failed to find User Operation: ${error.message}`);
  }
}
