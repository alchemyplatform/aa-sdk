import { BaseError } from "../errors/base.js";

export class NoAlchemyAccountContextError extends BaseError {
  constructor(hookName: string) {
    super(`${hookName} must be used within a AlchemyAxccountProvider`);
  }
}

export class ClientUndefinedHookError extends BaseError {
  constructor(hookName: string) {
    super(`client must be defined in ${hookName}`);
  }
}
