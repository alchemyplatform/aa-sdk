import { BaseError } from "./base.js";

export class AccountNotFoundError extends BaseError {
  override name = "AccountNotFoundError";

  // TODO: extend this further using docs path as well
  constructor() {
    super("Could not find an Account to execute with this Action.");
  }
}
