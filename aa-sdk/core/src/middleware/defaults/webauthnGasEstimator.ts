import { AccountNotFoundError } from "../../errors/account.js";
import type { ClientMiddlewareFn } from "../types";
import { defaultGasEstimator } from "./gasEstimator.js";
import { type Hex } from "viem";

export const rip7212CheckBytecode =
  "0x60806040526040517f532eaabd9574880dbf76b9b8cc00832c20a6ec113d682299550d7a6e0f345e25815260056020820152600160408201527f4a03ef9f92eb268cafa601072489a56380fa0dc43171d7712813b3a19a1eb5e560608201527f3e213e28a608ce9a2f4a17fd830c6654018a79b3e0263d91a8ba90622df6f2f0608082015260208160a0836101005afa503d5f823e3d81f3fe";

/**
 * A middleware function to estimate the gas usage of a user operation when using a Modular Account V2 WebAuthn account. Has an optional custom gas estimator.
 * This function is only compatible with accounts using EntryPoint v0.7.0, and the account must have an implementation address defined in `getImplementationAddress()`.
 *
 * @example
 * ```ts twoslash
 * import {
 *   webauthnGasEstimator,
 *   createSmartAccountClient,
 *   type SmartAccountClient,
 * } from "@aa-sdk/core";
 * import {
 *   createModularAccountV2,
 *   type CreateModularAccountV2ClientParams,
 * } from "@account-kit/smart-contracts";
 *
 * const credential = {
 *   id: "credential-id",
 *   publicKey: "0x...",
 * }
 *
 * async function createWebauthnAccountClient(
 *   config: CreateModularAccountV2ClientParams
 * ): Promise<SmartAccountClient> {
 *   const webauthnAccount = await createModularAccountV2({ ...config, mode: "webauthn", credential });
 *
 *   return createSmartAccountClient({
 *     account: webAuthnAccount,
 *     gasEstimator: webauthnGasEstimator(config.gasEstimator),
 *     ...config,
 *   });
 * }
 * ```
 *
 * @param {ClientMiddlewareFn} [gasEstimator] Optional custom gas estimator function
 * @returns {ClientMiddlewareFn} A function that takes user operation struct and parameters, estimates gas usage, and returns the user operation with gas limits.
 */
export const webauthnGasEstimator: (
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

    const uo = await gasEstimator_(struct, params);

    const pvg: bigint | number | Hex | undefined =
      uo.verificationGasLimit instanceof Promise
        ? await uo.verificationGasLimit
        : (uo?.verificationGasLimit ?? 0n);

    if (!pvg) {
      throw new Error(
        "WebauthnGasEstimator: verificationGasLimit is 0 or not defined",
      );
    }

    // perform eth call read check to see if the chain has 7212
    const { data } = await params.client.call({ data: rip7212CheckBytecode });

    const chainHas7212: boolean = data ? BigInt(data) === 1n : false;

    // TODO: iterate numbers. Aim to have ~1000 gas buffer to account for longer authenticatorDatas and clientDataJSONs
    return {
      ...uo,
      verificationGasLimit:
        BigInt(typeof pvg === "string" ? BigInt(pvg) : pvg) +
        (chainHas7212 ? 10000n : 300000n),
    };
  };
