import { BaseError } from "@alchemy/common";

/**
 * Error class denoting that the provided entity id is invalid because it's overriding the native entity id.
 */
export class EntityIdOverrideError extends BaseError {
  override name = "EntityIdOverrideError";

  /**
   * Initializes a new instance of the error message with a default message indicating that the nonce key is invalid.
   */
  constructor() {
    super(`EntityId of 0 is reserved for the owner and cannot be used`);
  }
}
