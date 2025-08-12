import { BaseError } from "viem";

export const raise = (err: string | BaseError): never => {
  if (typeof err === "string") {
    throw new BaseError(err);
  }
  throw err;
};
