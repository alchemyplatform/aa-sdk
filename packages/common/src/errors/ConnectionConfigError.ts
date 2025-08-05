import { BaseError } from "./BaseError.js";

/**
 * Error class for connection configuration validation failures.
 */
export class ConnectionConfigError extends BaseError {
  override name = "ConnectionConfigError";

  // TODO: extend this further using docs path as well for debugging connection-related problems

  /**
   * Creates a new ConnectionConfigError with details about the validation failure.
   * 
   * @param {string} [details] Optional details about the specific validation failure
   */
  constructor(details?: string) {
    const message = details 
      ? `Invalid Alchemy connection configuration: ${details}`
      : 'Invalid Alchemy connection configuration';
    super(message);
  }
}