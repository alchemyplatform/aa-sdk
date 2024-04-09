import type { ClientMiddlewareFn } from "../types";

/**
 *
 * @returns
 */
export const overridePaymasterDataMiddleware: ClientMiddlewareFn = async (
  struct,
  { overrides }
) => {
  struct.paymasterAndData =
    overrides?.paymasterAndData != null ? overrides?.paymasterAndData : "0x";
  return struct;
};
