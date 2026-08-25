import { BaseError } from "./BaseError.js";

/**
 * Error class representing a "Fetch Error" error, typically thrown when a fetch request fails.
 */
export class FetchError extends BaseError {
  override name = "FetchError";

  /**
   * Initializes a fetch error for a request that failed before a response.
   *
   * @param {string} route - The route that failed to fetch.
   * @param {string} method - The HTTP method that was used.
   * @param {Error} cause - The cause of the error.
   */
  constructor(route: string, method: string, cause?: Error) {
    super(`[${method}] ${route} failed to fetch`, {
      cause,
    });
  }
}
