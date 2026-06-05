import { BaseError } from "../errors/BaseError.js";

/**
 * Raises an error.
 *
 * @param {string | BaseError} err - The error to raise.
 * @returns {never} Always throws an error.
 */
export const raise = (err: string | BaseError): never => {
  if (typeof err === "string") {
    throw new BaseError(err);
  }
  throw err;
};
