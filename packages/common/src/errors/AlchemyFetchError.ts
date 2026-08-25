import {
  AlchemyApiError,
  type AlchemyApiErrorDetails,
} from "./AlchemyApiError.js";

/**
 * Viem-free fetch failure for the shared REST/JSON-RPC runtime.
 */
export class AlchemyFetchError extends AlchemyApiError {
  override name = "AlchemyFetchError";

  /**
   * Initializes a new fetch error for a request that failed before a response.
   *
   * @param {string} route - The route that failed to fetch.
   * @param {string} method - The HTTP method that was used.
   * @param {Error} cause - The cause of the error.
   * @param {AlchemyApiErrorDetails} apiDetails - Normalized failure metadata.
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
