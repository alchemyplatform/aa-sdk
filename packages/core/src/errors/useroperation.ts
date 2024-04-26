import type { UserOperationStruct } from "../types.js";
import { BaseError } from "./base.js";

/**
 * Thrown when a {@link UserOperationStruct} is not a valid request
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
   * @param uo the invalid user operation struct
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
