import { AccountNotFoundError } from "../../errors/account.js";
import type { UserOperationStruct } from "../../types.js";
import type { ClientMiddlewareFn } from "../types";
import { defaultGasEstimator } from "./gasEstimator.js";

export const default7702GasEstimator: ClientMiddlewareFn = async (
  struct,
  params
) => {
  const account = params.account ?? params.client.account;
  if (!account) {
    throw new AccountNotFoundError();
  }

  const implementationAddress = await account.getImplementationAddress();

  // todo: do we need to omit this from estimation if the account is already 7702 delegated? Not omitting for now.

  (struct as UserOperationStruct<"0.7.0">).authorizationContract =
    implementationAddress;

  return defaultGasEstimator(params.client)(struct, params);
};
