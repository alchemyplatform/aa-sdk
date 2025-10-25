import type { PrepareCallsResult } from "./prepareCalls.ts";
import { BaseError, type SmartAccountSigner } from "@aa-sdk/core";
import { signSignatureRequest } from "./signSignatureRequest.js";
import type { WalletServerRpcSchemaType } from "@alchemy/wallet-api-types/rpc";
import type {
  PreparedCall_Authorization,
  PreparedCall_UserOpV060,
  PreparedCall_UserOpV070,
} from "@alchemy/wallet-api-types";
import { metrics } from "../../metrics.js";
import { assertNever } from "../../utils.js";

type RpcSchema = Extract<
  WalletServerRpcSchemaType,
  {
    Request: {
      method: "wallet_sendPreparedCalls";
    };
  }
>;

export type SignPreparedCallsParams = PrepareCallsResult;

export type SignPreparedCallsResult = RpcSchema["Request"]["params"][0];

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
  metrics.trackEvent({
    name: "sign_prepared_calls",
    data: {
      type: params.type,
    },
  });

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

    if (!signatureRequest) {
      throw new BaseError(
        "Signature request is required for signing user operation calls. Ensure `onlyEstimation` is set to `false` when calling `prepareCalls`.",
      );
    }

    const signature = await signSignatureRequest(signer, signatureRequest);
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
