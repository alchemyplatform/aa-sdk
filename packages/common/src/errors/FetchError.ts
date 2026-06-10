import {
  AlchemyApiError,
  type AlchemyApiErrorDetails,
} from "./AlchemyApiError.js";

/**
 * Error class representing a "Fetch Error" error, typically thrown when a fetch request fails.
 */
export class FetchError extends AlchemyApiError {
  override name = "FetchError";

  /**
   * Initializes a new fetch error for a request that failed before a response.
   *
   * @param {string} route - The route that failed to fetch.
   * @param {string} method - The HTTP method that was used.
   * @param {Error} cause - The cause of the error.
   * @param {AlchemyApiErrorDetails} apiDetails - Normalized failure metadata (requestId).
   */
  constructor(
    route: string,
    method: string,
    cause?: Error,
    apiDetails?: AlchemyApiErrorDetails,
  ) {
    super(`[${method}] ${route} failed to fetch`, {
      cause,
      ...apiDetails,
    });
  }
}
