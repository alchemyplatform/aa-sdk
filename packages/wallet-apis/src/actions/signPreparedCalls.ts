import { assertNever, BaseError } from "@alchemy/common";
import type { PrepareCallsResult } from "./prepareCalls.ts";
import {
  signSignatureRequest,
  type SignSignatureRequestResult,
} from "./signSignatureRequest.js";
import type { Prettify } from "viem";
import type { InnerWalletApiClient } from "../types.js";
import { LOGGER } from "../logger.js";

export type SignPreparedCallsParams = Prettify<PrepareCallsResult>;

/** Replace signatureRequest/feePayment with the actual signature produced by signPreparedCalls. */
type Signed<T> = T extends { signatureRequest?: unknown }
  ? Prettify<
      Omit<T, "signatureRequest" | "feePayment"> & {
        signature: SignSignatureRequestResult;
      }
    >
  : never;

export type SignPreparedCallsResult =
  | {
      type: "array";
      data: Signed<
        Extract<PrepareCallsResult, { type: "array" }>["data"][number]
      >[];
    }
  | Signed<Extract<PrepareCallsResult, { type: "user-operation-v060" }>>
  | Signed<Extract<PrepareCallsResult, { type: "user-operation-v070" }>>;

// Decoded types derived from PrepareCallsResult (numbers/bigints, not hex strings)
type ArrayCallData = Extract<
  PrepareCallsResult,
  { type: "array" }
>["data"][number];
type AuthorizationCall = Extract<ArrayCallData, { type: "authorization" }>;
type UserOpCall = Exclude<ArrayCallData, { type: "authorization" }>;

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
  client: InnerWalletApiClient,
  params: SignPreparedCallsParams,
): Promise<SignPreparedCallsResult> {
  LOGGER.debug("signPreparedCalls:start", { type: params.type });

  const signAuthorizationCall = async (call: AuthorizationCall) => {
    const { signatureRequest: _signatureRequest, ...rest } = call;

    // chainId/nonce are decoded (number) from PrepareCallsResult;
    // signSignatureRequest handles both formats via Number().
    const signature = await signSignatureRequest(client, {
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

  const signUserOperationCall = async (call: UserOpCall) => {
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
    const res = {
      ...rest,
      signature,
    } as const;
    LOGGER.debug("signPreparedCalls:userOp:ok");
    return res;
  };

  if (params.type === "array") {
    const res = {
      type: "array" as const,
      data: await Promise.all(
        params.data.map((call) =>
          call.type === "authorization"
            ? signAuthorizationCall(call)
            : signUserOperationCall(call),
        ),
      ),
    };
    LOGGER.debug("signPreparedCalls:array:ok", { count: res.data.length });
    return res;
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
  } else {
    LOGGER.warn("signPreparedCalls:unexpected-call-type", {
      type: (params as { type?: unknown }).type,
    });
    return assertNever(
      params,
      `Unexpected call type in ${params} for signing prepared calls`,
    );
  }
}
