import { BaseError } from "../errors/BaseError.js";

/**
 * Asserts that a value is never.
 *
 * @param {never} _x - The value to assert.
 * @param {string} msg - The message to throw if the value is not never.
 * @returns {never} Always throws an error.
 */
export const assertNever = (_x: never, msg: string): never => {
  throw new BaseError(msg);
};
