import { BaseError } from "./BaseError.js";

/**
 * Error class representing a "Server Error" error, typically thrown when a server request fails.
 */
export class ServerError extends BaseError {
  override name = "ServerError";

  /**
   * Initializes a server error for a failed HTTP response.
   *
   * @param {string} message - The error message.
   * @param {number} status - The HTTP status code of the error.
   * @param {Error} cause - The cause of the error.
   */
  constructor(message: string, status: number, cause?: Error) {
    super(`HTTP request failed with status ${status}: ${message}`, {
      cause,
    });
  }
}
