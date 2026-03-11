import { BaseError } from "@alchemy/common";

/**
 * Error class denoting that the provided entity id is invalid because it's too large.
 */
export class InvalidEntityIdError extends BaseError {
  override name = "InvalidEntityIdError";

  /**
   * Initializes a new instance of the error message with a default message indicating that the entity id is invalid because it's too large.
   *
   * @param {number} entityId the invalid entityId used
   */
  constructor(entityId: number) {
    super(
      `Entity ID used is ${entityId}, but must be less than or equal to uint32.max`,
    );
  }
}
