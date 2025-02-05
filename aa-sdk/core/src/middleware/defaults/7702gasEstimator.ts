import { AccountNotFoundError } from "../../errors/account.js";
import type { UserOperationStruct } from "../../types.js";
import type { ClientMiddlewareFn } from "../types";
import { defaultGasEstimator } from "./gasEstimator.js";

/**
 * A middleware function to estimate the gas usage of a user operation when using an EIP-7702 delegated account. Has an optional custom gas estimator.
 * This function is only compatible with accounts using EntryPoint v0.7.0, and the account must have an implementation address defined in `getImplementationAddress()`.
 *
 * @example
 * ```ts twoslash
 * import {
 *   default7702GasEstimator,
 *   default7702UserOpSigner,
 *   createSmartAccountClient,
 *   type SmartAccountClient,
 * } from "@aa-sdk/core";
 * import {
 *   createSMA7702Account,
 *   type CreateSMA7702AccountClientParams,
 * } from "@account-kit/smart-contracts/experimental";
 *
 * async function createSMA7702AccountClient(
 *   config: CreateSMA7702AccountClientParams
 * ): Promise<SmartAccountClient> {
 *   const sma7702Account = await createSMA7702Account(config);
 *
 *   return createSmartAccountClient({
 *     account: sma7702Account,
 *     gasEstimator: default7702GasEstimator(config.gasEstimator),
 *     signUserOperation: default7702UserOpSigner(config.signUserOperation),
 *     ...config,
 *   });
 * }
 * ```
 *
 * @param {ClientMiddlewareFn} [gasEstimator] Optional custom gas estimator function
 * @returns {Function} A function that takes user operation struct and parameters, estimates gas usage, and returns the user operation with gas limits.
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

    const implementationAddress = await account.getImplementationAddress();

    // Note: does not omit the delegation from estimation if the account is already 7702 delegated.

    (struct as UserOperationStruct<"0.7.0">).authorizationContract =
      implementationAddress;

    const estimatedUO = await gasEstimator_(struct, params);

    estimatedUO.authorizationContract = undefined; // Strip out authorizationContract after estimation.

    return estimatedUO;
  };
