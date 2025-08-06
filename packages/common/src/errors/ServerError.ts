import { BaseError } from "./BaseError.js";

export class ServerError extends BaseError {
  override name = "ServerError";

  constructor(message: string, status: number, cause?: Error) {
    super(`HTTP request failed with status ${status}: ${message}`, {
      cause,
    });
  }
}
