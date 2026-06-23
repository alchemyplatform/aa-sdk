import {
  AlchemyApiError,
  type AlchemyApiErrorDetails,
} from "./AlchemyApiError.js";

/**
 * Viem-free HTTP response failure for the shared REST/JSON-RPC runtime.
 */
export class AlchemyServerError extends AlchemyApiError {
  override name = "AlchemyServerError";

  /**
   * Initializes a new server error for a failed HTTP response.
   *
   * @param {string} message - The error message.
   * @param {number} status - The HTTP status code of the error.
   * @param {Error} cause - The cause of the error.
   * @param {AlchemyApiErrorDetails} apiDetails - Normalized failure metadata.
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
