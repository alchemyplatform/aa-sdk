import { BaseError } from "@alchemy/common";

/**
 * Error class denoting that the owner for an account is invalid
 */
export class InvalidOwnerError extends BaseError {
  override name = "InvalidOwnerError";

  /**
   * Initializes a new instance of the error message with a default message indicating that the owner is invalid
   *
   * @param {string} reason the reason the owner is invalid
   */
  constructor(reason: string) {
    super(`Owner is invalid (${reason}).`);
  }
}
