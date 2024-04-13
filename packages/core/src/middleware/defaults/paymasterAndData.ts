import type { UserOperationStruct } from "../../types";
import type { ClientMiddlewareFn } from "../types";

export const defaultPaymasterAndData: ClientMiddlewareFn = async (
  struct,
  { account }
) => {
  const entryPoint = account.getEntryPoint();
  if (entryPoint.version === "0.6.0") {
    (struct as UserOperationStruct<"0.6.0">).paymasterAndData = "0x";
  }
  return struct;
};
