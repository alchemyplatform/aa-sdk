import { BaseError } from "@alchemy/common";
import { maxUint32 } from "viem";

/**
 * Error class denoting that the provided entity id is invalid because it's too large.
 */
export class InvalidEntityIdError extends BaseError {
  override name = "InvalidEntityIdError";

  /**
   * Initializes a new instance of the error message with a default message indicating that the entity id is invalid because it's too large.
   *
   * @param {number} entityId the invalid entityId used
   * @param {number | bigint} [maxAllowedInclusive] inclusive upper bound the entityId must not exceed. Defaults to `uint32.max`.
   */
  constructor(
    entityId: number,
    maxAllowedInclusive: number | bigint = maxUint32,
  ) {
    super(
      `Entity ID used is ${entityId}, but must be less than or equal to ${maxAllowedInclusive}`,
    );
  }
}
