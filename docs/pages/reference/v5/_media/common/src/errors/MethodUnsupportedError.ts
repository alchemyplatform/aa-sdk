import { BaseError } from "./BaseError.js";

/**
 * This error is thrown when an unknown method is called. It extends the `BaseError` class.
 */
export class MethodUnsupportedError extends BaseError {
  override name = "MethodUnsupportedError";

  /**
   * Constructor for initializing an error message indicating the method name that is unsupported.
   *
   * @param {string} method - The name of the unsupported method
   */
  constructor(method: string) {
    super(`Unsupported method: ${method}`);
  }
}
