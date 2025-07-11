import type { PrepareCallsResult } from "./prepareCalls.ts";
import type { SmartAccountSigner } from "@aa-sdk/core";
import { signSignatureRequest } from "./signSignatureRequest.js";
import type { Static } from "@sinclair/typebox";
import { wallet_sendPreparedCalls } from "@alchemy/wallet-api-types/rpc";
import {
  type PreparedCall_Authorization,
  type PreparedCall_UserOpV060,
  type PreparedCall_UserOpV070,
} from "@alchemy/wallet-api-types";

export type SignPreparedCallsParams = PrepareCallsResult;

export type SignPreparedCallsResult = Static<
  (typeof wallet_sendPreparedCalls)["properties"]["Request"]["properties"]["params"]
>[0];

/**
 * Signs prepared calls using the provided signer.
 *
 * @param {SmartAccountSigner} signer - The signer to use
 * @param {SignPreparedCallsParams} params - The prepared calls with signature requests
 * @returns {Promise<SignPreparedCallsResult>} A Promise that resolves to the signed calls
 */
export async function signPreparedCalls(
  signer: SmartAccountSigner,
  params: SignPreparedCallsParams,
): Promise<SignPreparedCallsResult> {
  const signAuthorizationCall = async (call: PreparedCall_Authorization) => {
    const { signatureRequest: _signatureRequest, ...rest } = call;
    const signature = await signSignatureRequest(signer, {
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
    const signature = await signSignatureRequest(signer, signatureRequest);
    return {
      ...rest,
      signature,
    };
  };

  return params.type === "array"
    ? {
        type: "array" as const,
        data: await Promise.all(
          params.data.map((call) =>
            call.type === "authorization"
              ? signAuthorizationCall(call)
              : signUserOperationCall(call),
          ),
        ),
      }
    : signUserOperationCall(params);
}
