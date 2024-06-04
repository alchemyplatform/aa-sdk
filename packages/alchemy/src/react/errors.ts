import { BaseError } from "../errors/base.js";

/**
 * Error thrown when a hook is called without a AlchemyAccountProvider.
 *
 * @param hookName The name of the hook.
 */
export class NoAlchemyAccountContextError extends BaseError {
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
  constructor(hookName: string) {
    super(`client must be defined in ${hookName}`);
  }
}

/**
 * An error thrown by hooks that require a uiConfig to be supplied to the AlchemyAccountProvider.
 */
export class MissingUiConfigError extends BaseError {
  /**
   * @param hookName the name of the hook that is throwing this error
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
   * @param hookName the hook that threw the error
   * @param action the action not supported by an EOA
   */
  constructor(hookName: string, action: string) {
    super(`${hookName}: ${action} is not supported for EOA accounts`);
  }
}
