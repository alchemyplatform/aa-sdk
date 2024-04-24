import { BaseError } from "../errors/base.js";

/**
 * Description
 *
 * Error indicating the function was called outside of
 * client context for fetching client only properties
 *
 */
export class ClientOnlyPropertyError extends BaseError {
  /**
   * Description name string for the error
   *
   */
  name: string = "ClientOnlyPropertyError";

  /**
   * Creates an instance of ClientOnlyPropertyError.
   *
   * @param property name of the property that is client only
   */
  constructor(property: string) {
    super(`${property} is only available on the client`);
  }
}
