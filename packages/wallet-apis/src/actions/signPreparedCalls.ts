import { assertNever, BaseError } from "@alchemy/common";
import type { PrepareCallsResult } from "./prepareCalls.ts";
import { signSignatureRequest } from "./signSignatureRequest.js";
import { numberToHex, type Prettify } from "viem";
import type { InnerWalletApiClient } from "../types.js";
import { LOGGER } from "../logger.js";
import type {
  SignedPreparedCalls,
  SignedUserOperation,
  SignedAuthorization,
} from "../types.js";
import type {
  PrepareCallsResult_Authorization,
  PrepareCallsResult_UserOp,
} from "../utils/viemEncode.js";

export type SignPreparedCallsParams = Prettify<PrepareCallsResult>;

export type SignPreparedCallsResult = Prettify<SignedPreparedCalls>;

/**
 * Signs prepared calls using the provided signer.
 *
 * @param {InnerWalletApiClient} client - The wallet client to use for signing
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
 *     value: 0n
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
  client: InnerWalletApiClient,
  params: SignPreparedCallsParams,
): Promise<SignPreparedCallsResult> {
  LOGGER.debug("signPreparedCalls:start", { type: params.type });

  const signAuthorizationCall = async (
    call: PrepareCallsResult_Authorization,
  ): Promise<SignedAuthorization> => {
    const signature = await signSignatureRequest(client, {
      type: "eip7702Auth",
      data: {
        address: call.data.address,
        nonce: numberToHex(call.data.nonce),
        chainId: numberToHex(call.chainId),
      },
    });

    return {
      type: "authorization",
      chainId: call.chainId,
      data: {
        address: call.data.address,
        nonce: call.data.nonce,
      },
      signature,
    };
  };

  const signUserOperationCall = async (
    call: PrepareCallsResult_UserOp,
  ): Promise<SignedUserOperation> => {
    const { signatureRequest, ...rest } = call;

    if (!signatureRequest) {
      LOGGER.warn("signPreparedCalls:missing-signatureRequest", {
        type: call.type,
      });
      throw new BaseError(
        "Signature request is required for signing user operation calls. Ensure `onlyEstimation` is set to `false` when calling `prepareCalls`.",
      );
    }

    const signature = await signSignatureRequest(client, signatureRequest);

    return {
      type: rest.type,
      chainId: rest.chainId,
      data: rest.data,
      signature,
    };
  };

  if (params.type === "array") {
    const signedData = await Promise.all(
      params.data.map((call) =>
        call.type === "authorization"
          ? signAuthorizationCall(call)
          : signUserOperationCall(call),
      ),
    );
    LOGGER.debug("signPreparedCalls:array:ok", { count: signedData.length });
    return {
      type: "array",
      data: signedData,
    };
  } else if (
    params.type === "user-operation-v060" ||
    params.type === "user-operation-v070"
  ) {
    const res = await signUserOperationCall(params);
    LOGGER.debug("signPreparedCalls:single-userOp:ok");
    return res;
  } else if (params.type === "paymaster-permit") {
    LOGGER.warn("signPreparedCalls:invalid-call-type", { type: params.type });
    throw new BaseError(
      `Invalid call type ${params.type} for signing prepared calls`,
    );
  }

  // This should be unreachable - all valid types are handled above
  LOGGER.warn("signPreparedCalls:unexpected-call-type", {
    type: (params as { type?: unknown }).type,
  });
  return assertNever(
    params as never,
    `Unexpected call type for signing prepared calls`,
  );
}
