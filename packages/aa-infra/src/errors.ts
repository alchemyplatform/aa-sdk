import { BaseError } from "@alchemy/common";

/**
 * Error thrown when an invalid hex value is encountered during fee estimation.
 */
export class InvalidHexValueError extends BaseError {
  override name = "InvalidHexValueError";

  constructor(value: unknown) {
    super(`Invalid hex value: ${value}`);
  }
}
