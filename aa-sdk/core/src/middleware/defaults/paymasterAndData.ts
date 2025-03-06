import type { UserOperationStruct } from "../../types";
import type { ClientMiddlewareFn } from "../types";

/**
 * Middleware function that sets the `paymasterAndData` field in the given struct based on the entry point version of the account.
 * This is the default used by `createSmartAccountClient` and is not necessary to be used directly.
 *
 * @param {UserOperationStruct} struct the user operation structure to be modified
 * @param {{ account: Account }} context an object containing the account information
 * @returns {Promise<UserOperationStruct>} a promise that resolves to the modified user operation structure
 */
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
