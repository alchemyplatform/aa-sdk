import { AccountNotFoundError } from "../../errors/account.js";
import type { UserOperationStruct } from "../../types.js";
import type { ClientMiddlewareFn } from "../types";
import { defaultGasEstimator } from "./gasEstimator.js";

/**
 * A middleware function to estimate the gas usage of a user operation with an optional custom gas estimator.
 * This function is only compatible with accounts using EntryPoint v0.7.0.
 *
 * @param {ClientMiddlewareFn} [gasEstimator] An optional custom gas estimator function
 * @returns {Function} A function that takes user operation structure and parameters, estimates gas usage, and returns the estimated user operation
 */
export const default7702GasEstimator: (
  gasEstimator?: ClientMiddlewareFn
) => ClientMiddlewareFn =
  (gasEstimator?: ClientMiddlewareFn) => async (struct, params) => {
    const gasEstimator_ = gasEstimator ?? defaultGasEstimator(params.client);

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

    const estimatedUO = await gasEstimator_(struct, params);

    estimatedUO.authorizationContract = undefined; // Strip out authorizationContract after estimation.

    return estimatedUO;
  };
