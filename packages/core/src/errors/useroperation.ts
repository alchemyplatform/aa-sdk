import type { EntryPointVersion } from "../entrypoint/types.js";
import type { UserOperationStruct } from "../types.js";
import { BaseError } from "./base.js";

export class InvalidUserOperationError extends BaseError {
  override name = "InvalidUserOperationError";
  constructor(uo: UserOperationStruct<EntryPointVersion>) {
    super(
      `Request is missing parameters. All properties on UserOperationStruct must be set. uo: ${JSON.stringify(
        uo,
        null,
        2
      )}`
    );
  }
}
