import {
  AlchemyApiError,
  type AlchemyApiErrorDetails,
} from "./AlchemyApiError.js";

/**
 * Error class representing a "Server Error" error, typically thrown when a server request fails.
 */
export class ServerError extends AlchemyApiError {
  override name = "ServerError";

  /**
   * Initializes a new server error for a failed HTTP response.
   *
   * @param {string} message - The error message.
   * @param {number} status - The HTTP status code of the error.
   * @param {Error} cause - The cause of the error.
   * @param {AlchemyApiErrorDetails} apiDetails - Normalized failure metadata (requestId, retryAfter, code).
   */
  constructor(
    message: string,
    status: number,
    cause?: Error,
    apiDetails?: AlchemyApiErrorDetails,
  ) {
    super(`HTTP request failed with status ${status}: ${message}`, {
      cause,
      ...apiDetails,
      status,
    });
  }
}
