import { BaseError } from "./BaseError.js";

/**
 * Error class representing a "Chain Not Found" error, typically thrown when no chain is supplied to the client.
 */
export class ChainNotFoundError extends BaseError {
  override name = "ChainNotFoundError";

  /**
   * Initializes a new instance of the error message with a default message indicating that no chain was supplied to the client.
   */
  constructor() {
    super("No chain supplied to the client");
  }
}
