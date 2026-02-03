import { assertNever, BaseError } from "@alchemy/common";
import type { PrepareCallsResult } from "./prepareCalls.ts";
import { signSignatureRequest } from "./signSignatureRequest.js";
import { numberToHex, toHex, type Prettify } from "viem";
import type { InnerWalletApiClient } from "../types.js";
import { LOGGER } from "../logger.js";
import type { SendPreparedCallsParams } from "./sendPreparedCalls.js";
import type {
  PrepareCallsResult_Authorization,
  PrepareCallsResult_UserOp,
} from "../utils/viemEncode.js";

export type SignPreparedCallsParams = Prettify<PrepareCallsResult>;

export type SignPreparedCallsResult = SendPreparedCallsParams;

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

  // Helper to convert authorization call from viem-native to RPC format and sign
  const signAuthorizationCall = async (
    call: PrepareCallsResult_Authorization,
  ) => {
    const { signatureRequest: _signatureRequest, ...rest } = call;

    // Convert number values to hex for signing
    const signature = await signSignatureRequest(client, {
      type: "eip7702Auth",
      data: {
        address: rest.data.address,
        nonce: numberToHex(rest.data.nonce),
        chainId: numberToHex(call.chainId),
      },
    });

    // Return in RPC format for sendPreparedCalls
    return {
      type: rest.type,
      chainId: numberToHex(rest.chainId),
      data: {
        address: rest.data.address,
        nonce: numberToHex(rest.data.nonce),
      },
      signature,
    };
  };

  // Helper to convert user operation from viem-native to RPC format and sign
  const signUserOperationCall = async (call: PrepareCallsResult_UserOp) => {
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

    // Convert user operation data back to RPC format
    const rpcData = toRpcUserOperationData(rest.data, rest.type);

    const res = {
      type: rest.type,
      chainId: numberToHex(rest.chainId),
      data: rpcData,
      signature,
    };
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
    // Cast to satisfy RPC schema - our converted data matches the expected format
    return res as unknown as SignPreparedCallsResult;
  } else if (
    params.type === "user-operation-v060" ||
    params.type === "user-operation-v070"
  ) {
    const res = await signUserOperationCall(params);
    LOGGER.debug("signPreparedCalls:single-userOp:ok");
    // Cast to satisfy RPC schema - we preserve the specific type from input
    return res as unknown as SignPreparedCallsResult;
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

// Helper function to convert viem-native user operation data back to RPC format
function toRpcUserOperationData(
  data: PrepareCallsResult_UserOp["data"],
  type: "user-operation-v060" | "user-operation-v070",
) {
  if (type === "user-operation-v060") {
    const uo = data as Exclude<
      PrepareCallsResult_UserOp["data"],
      { factory?: unknown }
    >;
    return {
      sender: uo.sender,
      nonce: toHex(uo.nonce),
      initCode: uo.initCode,
      callData: uo.callData,
      callGasLimit: toHex(uo.callGasLimit),
      verificationGasLimit: toHex(uo.verificationGasLimit),
      preVerificationGas: toHex(uo.preVerificationGas),
      maxFeePerGas: toHex(uo.maxFeePerGas),
      maxPriorityFeePerGas: toHex(uo.maxPriorityFeePerGas),
      paymasterAndData: (uo as { paymasterAndData?: unknown }).paymasterAndData,
    };
  }

  // v0.7
  const uo = data as Extract<
    PrepareCallsResult_UserOp["data"],
    { factory?: unknown }
  >;
  return {
    sender: uo.sender,
    nonce: toHex(uo.nonce),
    factory: uo.factory,
    factoryData: uo.factoryData,
    callData: uo.callData,
    callGasLimit: toHex(uo.callGasLimit),
    verificationGasLimit: toHex(uo.verificationGasLimit),
    preVerificationGas: toHex(uo.preVerificationGas),
    maxFeePerGas: toHex(uo.maxFeePerGas),
    maxPriorityFeePerGas: toHex(uo.maxPriorityFeePerGas),
    paymaster: uo.paymaster,
    paymasterData: uo.paymasterData,
    paymasterVerificationGasLimit:
      uo.paymasterVerificationGasLimit != null
        ? toHex(uo.paymasterVerificationGasLimit)
        : undefined,
    paymasterPostOpGasLimit:
      uo.paymasterPostOpGasLimit != null
        ? toHex(uo.paymasterPostOpGasLimit)
        : undefined,
  };
}
