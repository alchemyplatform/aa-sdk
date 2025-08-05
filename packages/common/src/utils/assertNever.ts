import { BaseError } from "../errors/BaseError.js";

export const assertNever = (_x: never, msg: string): never => {
  throw new BaseError(msg);
};
