import type { ClientMiddlewareFn } from "../types";

export const defaultPaymasterAndData: ClientMiddlewareFn = async (struct) => {
  struct.paymasterAndData = "0x";
  return struct;
};
