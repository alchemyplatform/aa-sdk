import { BaseError as CoreBaseError } from "@aa-sdk/core";
import { VERSION } from "./version.js";

/**
 * Abstract BaseError class that extends from CoreBaseError.
 * This class redefines a version which may differ from the `aa-core` version.
 */
export abstract class BaseError extends CoreBaseError {
  // This version could be different from the aa-core version so we overwrite this here.
  override version = VERSION;
}

/**
 * Error thrown when a hook is called without a AlchemyAccountProvider.
 *
 * @param hookName The name of the hook.
 */
export class NoAlchemyAccountContextError extends BaseError {
  /**
   * Constructs an error message indicating that a specific hook must be used within an AlchemyAccountProvider.
   *
   * @param {string} hookName The name of the hook that must be used within the AlchemyAccountProvider
   */
  constructor(hookName: string) {
    super(`${hookName} must be used within a AlchemyAccountProvider`);
  }
}

/**
 * Error thrown when a hook is called without a client.
 *
 * @param hookName The name of the hook.
 */
export class ClientUndefinedHookError extends BaseError {
  /**
   * Initializes an error message indicating that the client must be defined for the specified hook name.
   *
   * @param {string} hookName The name of the hook where the client is required
   */
  constructor(hookName: string) {
    super(`client must be defined in ${hookName}`);
  }
}

/**
 * An error thrown by hooks that require a uiConfig to be supplied to the AlchemyAccountProvider.
 */
export class MissingUiConfigError extends BaseError {
  /**
   * @param {string} hookName the name of the hook that is throwing this error
   */
  constructor(hookName: string) {
    super(
      `${hookName}: uiConfig must be supplied to AlchemyAccountProvider to use this hook`
    );
  }
}

/**
 * An error thrown when connected to an EOA and trying to execute an action that is not supported.
 */
export class UnsupportedEOAActionError extends BaseError {
  /**
   * @param {string} hookName the hook that threw the error
   * @param {string} action the action not supported by an EOA
   */
  constructor(hookName: string, action: string) {
    super(`${hookName}: ${action} is not supported for EOA accounts`);
  }
}
