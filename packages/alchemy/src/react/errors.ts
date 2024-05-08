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
