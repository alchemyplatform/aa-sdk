import { MismatchingEntryPointError } from "../../errors/entrypoint.js";
import type { UserOperationStruct } from "../../types";
import type { ClientMiddlewareFn } from "../types";

export const defaultPaymasterAndData: ClientMiddlewareFn = async (
  struct,
  { account }
) => {
  const entryPoint = account.getEntryPoint();
  if (entryPoint.isUserOpVersion(struct)) {
    throw new MismatchingEntryPointError(entryPoint.version, struct);
  }

  if (entryPoint.version === "0.6.0") {
    (struct as UserOperationStruct<"0.6.0">).paymasterAndData = "0x";
  } else {
    (struct as UserOperationStruct<"0.7.0">).paymaster = "0x0";
    (struct as UserOperationStruct<"0.7.0">).paymasterData = "0x";
  }
  return struct;
};
