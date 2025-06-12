import { BaseError } from "./BaseError.js";

export class FetchError extends BaseError {
  override name = "FetchError";

  constructor(route: string, method: string, cause?: Error) {
    super(`[${method}] ${route} failed to fetch`, {
      cause,
    });
  }
}
