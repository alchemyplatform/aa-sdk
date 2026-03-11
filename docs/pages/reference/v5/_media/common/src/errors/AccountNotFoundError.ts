import { BaseError } from "./BaseError.js";

/**
 * This error is thrown when an account could not be found to execute a specific action. It extends the `BaseError` class.
 */
export class AccountNotFoundError extends BaseError {
  override name = "AccountNotFoundError";

  // TODO: extend this further using docs path as well

  /**
   * Constructor for initializing an error message indicating that an account could not be found to execute the specified action.
   */ constructor() {
    super("Could not find an Account to execute with this Action.");
  }
}
