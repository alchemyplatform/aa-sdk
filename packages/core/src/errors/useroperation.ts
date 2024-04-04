import type { UserOperationStruct } from "../types.js";
import { BaseError } from "./base.js";

export class InvalidUserOperationError extends BaseError {
  override name = "InvalidUserOperationError";
  constructor(uo: UserOperationStruct) {
    super(
      `Request is missing parameters. All properties on UserOperationStruct must be set. uo: ${JSON.stringify(
        uo,
        null,
        2
      )}`
    );
  }
}
