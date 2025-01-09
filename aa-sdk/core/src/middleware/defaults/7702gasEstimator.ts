import { AccountNotFoundError } from "../../errors/account.js";
import type { UserOperationStruct } from "../../types.js";
import type { ClientMiddlewareFn } from "../types";
import { defaultGasEstimator } from "./gasEstimator.js";

/**
 * Asynchronously processes a given struct and parameters, ensuring the account and entry point compatibility before modifying the struct with an authorization contract and estimating gas.
 *
 * @param {UserOperationStruct} struct The user operation structure to estimate gas over
 * @param {*} params The parameters containing an account or a client with an account.
 * @throws {AccountNotFoundError} If no account is found in the parameters.
 * @throws {Error} If the account's entry point version is not 0.7.0.
 * @returns {Promise<UserOperationStruct>} A promise that resolves after estimating gas with the modified struct.
 */
export const default7702GasEstimator: ClientMiddlewareFn = async (
  struct,
  params
) => {
  const account = params.account ?? params.client.account;
  if (!account) {
    throw new AccountNotFoundError();
  }

  const entryPoint = account.getEntryPoint();
  if (entryPoint.version !== "0.7.0") {
    throw new Error(
      "This middleware is only compatible with EntryPoint v0.7.0"
    );
  }

  // todo: this is currently overloading the meaning of the getImplementationAddress method, replace with a dedicated method or clarify intention in docs
  const implementationAddress = await account.getImplementationAddress();

  // todo: do we need to omit this from estimation if the account is already 7702 delegated? Not omitting for now.

  (struct as UserOperationStruct<"0.7.0">).authorizationContract =
    implementationAddress;

  const estimatedUO = await defaultGasEstimator(params.client)(struct, params);

  estimatedUO.authorizationContract = undefined; // Strip out authorizationContract after estimation.

  return estimatedUO;
};
