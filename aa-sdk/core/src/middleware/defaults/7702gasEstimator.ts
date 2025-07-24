import { concatHex, numberToHex, zeroHash } from "viem";
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
 *   createModularAccountV2,
 *   type CreateModularAccountV2ClientParams,
 * } from "@account-kit/smart-contracts";
 *
 * async function createSMA7702AccountClient(
 *   config: CreateModularAccountV2ClientParams
 * ): Promise<SmartAccountClient> {
 *   const sma7702Account = await createModularAccountV2({ ...config, mode: "7702" });
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
 * @param {ClientMiddlewareFn} gasEstimator Optional custom gas estimator function
 * @returns {ClientMiddlewareFn} A function that takes user operation struct and parameters, estimates gas usage, and returns the user operation with gas limits.
 */
export const default7702GasEstimator: (
  gasEstimator?: ClientMiddlewareFn,
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
        "This middleware is only compatible with EntryPoint v0.7.0",
      );
    }

    const [implementationAddress, code = "0x"] = await Promise.all([
      account.getImplementationAddress(),
      params.client.getCode({ address: params.account.address }),
    ]);

    const isAlreadyDelegated =
      code.toLowerCase() === concatHex(["0xef0100", implementationAddress]);

    if (!isAlreadyDelegated) {
      (struct as UserOperationStruct<"0.7.0">).eip7702Auth = {
        chainId: numberToHex(params.client.chain?.id ?? 0),
        nonce: numberToHex(
          await params.client.getTransactionCount({
            address: params.account.address,
          }),
        ),
        address: implementationAddress,
        r: zeroHash, // aka `bytes32(0)`
        s: zeroHash,
        yParity: "0x0",
      };
    }

    return gasEstimator_(struct, params);
  };
