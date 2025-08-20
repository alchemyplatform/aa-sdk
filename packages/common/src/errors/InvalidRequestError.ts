import { BaseError } from "./BaseError.js";

/**
 * This error is thrown when an invalid request is made. It extends the `BaseError` class.
 */
export class InvalidRequestError extends BaseError {
  override name = "InvalidRequestError";

  // TODO: extend this further using docs path as well

  /**
   * Constructor for initializing an InvalidRequestError.
   *
   * @param {string} message - Optional error message. Defaults to "Invalid request" if not provided.
   */
  constructor(message?: string) {
    super(message || "Invalid request");
  }
}
