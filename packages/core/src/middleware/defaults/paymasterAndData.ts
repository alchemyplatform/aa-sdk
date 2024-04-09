import type { ClientMiddlewareFn } from "../types";

/**
 *
 * @returns
 */
export const defaultPaymasterAndData: ClientMiddlewareFn = async (struct) => {
  struct.paymasterAndData = "0x";
  return struct;
};
