import { AccountNotFoundError } from "../../errors/account.js";
import type { ClientMiddlewareFn } from "../types";
import { defaultGasEstimator } from "./gasEstimator.js";

export const rip7212CheckBytecode =
  "0x60806040526040517f532eaabd9574880dbf76b9b8cc00832c20a6ec113d682299550d7a6e0f345e25815260056020820152600160408201527f4a03ef9f92eb268cafa601072489a56380fa0dc43171d7712813b3a19a1eb5e560608201527f3e213e28a608ce9a2f4a17fd830c6654018a79b3e0263d91a8ba90622df6f2f0608082015260208160a0836101005afa503d5f823e3d81f3fe";

export const webauthnGasEstimator: (
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

    const uo = await gasEstimator_(struct, params);

    // perform eth call read check to see if the chain has 7212
    const { data } = await params.client.call({ data: rip7212CheckBytecode });

    const chainHas7212: boolean = data ? BigInt(data) == 1n : false;

    if (
      !uo.preVerificationGas ||
      (typeof uo.preVerificationGas !== "string" &&
        typeof uo.preVerificationGas !== "bigint" &&
        typeof uo.preVerificationGas !== "number")
    ) {
      throw new Error(
        "WebauthnGasEstimator: preVerificationGas is 0 or not defined"
      );
    }

    // TODO: iterate numbers. Aim to have ~1000 gas buffer to account for longer authenticatorDatas and clientDataJSONs
    return {
      ...uo,
      preVerificationGas:
        BigInt(uo.preVerificationGas) + (chainHas7212 ? 10000n : 300000n),
    };
  };
