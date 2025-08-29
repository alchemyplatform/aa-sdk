import type { Static } from "@sinclair/typebox";
import { assertNever, BaseError } from "@alchemy/common";
import type { wallet_sendPreparedCalls } from "@alchemy/wallet-api-types/rpc";
import type { PrepareCallsResult } from "./prepareCalls.ts";
import { signSignatureRequest } from "./signSignatureRequest.js";
import type { Prettify } from "viem";
import type {
  PreparedCall_Authorization,
  PreparedCall_UserOpV060,
  PreparedCall_UserOpV070,
} from "@alchemy/wallet-api-types";
import type { SignerClient } from "../types.js";

export type SignPreparedCallsParams = Prettify<PrepareCallsResult>;

export type SignPreparedCallsResult = Prettify<
  Static<
    (typeof wallet_sendPreparedCalls)["properties"]["Request"]["properties"]["params"]
  >[0]
>;

/**
 * Signs prepared calls using the provided signer.
 *
 * @param {SignerClient} signerClient - The wallet client to use for signing
 * @param {SignPreparedCallsParams} params - The prepared calls with signature requests
 * @returns {Promise<SignPreparedCallsResult>} A Promise that resolves to the signed calls
 *
 * @example
 * ```ts
 * // Prepare a user operation call.
 * const preparedCalls = await client.prepareCalls({
 *   calls: [{
 *     to: "0x1234...",
 *     data: "0xabcdef...",
 *     value: "0x0"
 *   }],
 * });
 *
 * // Sign the prepared calls.
 * const signedCalls = await client.signPreparedCalls(preparedCalls);
 *
 * // Send the signed calls.
 * const result = await client.sendPreparedCalls(signedCalls);
 * ```
 */
export async function signPreparedCalls(
  signerClient: SignerClient,
  params: SignPreparedCallsParams,
): Promise<SignPreparedCallsResult> {
  const signAuthorizationCall = async (call: PreparedCall_Authorization) => {
    const { signatureRequest: _signatureRequest, ...rest } = call;
    const signature = await signSignatureRequest(signerClient, {
      type: "eip7702Auth",
      data: {
        ...rest.data,
        chainId: call.chainId,
      },
    });
    return {
      ...rest,
      signature,
    };
  };

  const signUserOperationCall = async (
    call: PreparedCall_UserOpV060 | PreparedCall_UserOpV070,
  ) => {
    const { signatureRequest, ...rest } = call;

    if (!signatureRequest) {
      throw new BaseError(
        "Signature request is required for signing user operation calls. Ensure `onlyEstimation` is set to `false` when calling `prepareCalls`.",
      );
    }

    const signature = await signSignatureRequest(
      signerClient,
      signatureRequest,
    );
    return {
      ...rest,
      signature,
    };
  };

  if (params.type === "array") {
    return {
      type: "array" as const,
      data: await Promise.all(
        params.data.map((call) =>
          call.type === "authorization"
            ? signAuthorizationCall(call)
            : signUserOperationCall(call),
        ),
      ),
    };
  } else if (
    params.type === "user-operation-v060" ||
    params.type === "user-operation-v070"
  ) {
    return signUserOperationCall(params);
  } else if (params.type === "paymaster-permit") {
    throw new BaseError(
      `Invalid call type ${params.type} for signing prepared calls`,
    );
  } else {
    return assertNever(
      params,
      `Unexpected call type in ${params} for signing prepared calls`,
    );
  }
}
