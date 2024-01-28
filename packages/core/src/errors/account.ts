import { BaseError } from "viem";
import { VERSION } from "../version.js";

export class AccountNotFoundError extends BaseError {
  override name = "AccountNotFoundError";
  override version = VERSION;

  // TODO: extend this further using docs path as well
  constructor() {
    super("Could not find an Account to execute with this Action.");
  }
}
