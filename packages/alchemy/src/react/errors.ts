import { BaseError } from "../errors/base.js";

export class NoAlchemyAccountContextError extends BaseError {
  constructor(hookName: string) {
    super(`${hookName} must be used within a AlchemyAccountProvider`);
  }
}

/**
 * Error thrown when a hook is called without a client.
 * @param hookName The name of the hook.
 */
export class ClientUndefinedHookError extends BaseError {
  constructor(hookName: string) {
    super(`client must be defined in ${hookName}`);
  }
}
