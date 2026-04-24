import { assertNever, BaseError } from "@alchemy/common";
import type {
  PrepareCallsResult,
  SolanaPrepareCallsResult,
} from "./prepareCalls.ts";
import {
  signSignatureRequest,
  type SignSignatureRequestResult,
} from "./signSignatureRequest.js";
import { signSolanaTransaction } from "./signSolanaTransaction.js";
import type { Prettify } from "viem";
import type { InnerWalletApiClient, Mode } from "../types.js";
import type { SolanaSendPreparedCallsParams } from "./sendPreparedCalls.js";
import { LOGGER } from "../logger.js";

// ── EVM types ────────────────────────────────────────────────────────────────

export type SignPreparedCallsParams = Prettify<PrepareCallsResult>;

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
  | Signed<Extract<PrepareCallsResult, { type: "user-operation-v070" }>>
  | Signed<Extract<PrepareCallsResult, { type: "authorization" }>>;

// ── Solana types ─────────────────────────────────────────────────────────────

export type SolanaSignPreparedCallsParams = Prettify<SolanaPrepareCallsResult>;

export type SolanaSignPreparedCallsResult = SolanaSendPreparedCallsParams;

// ── Derived helpers ──────────────────────────────────────────────────────────

type ArrayCallData = Extract<
  PrepareCallsResult,
  { type: "array" }
>["data"][number];
type AuthorizationCall = Extract<ArrayCallData, { type: "authorization" }>;
type UserOpCall = Exclude<ArrayCallData, { type: "authorization" }>;

// ── Overloads ────────────────────────────────────────────────────────────────

export async function signPreparedCalls(
  client: InnerWalletApiClient<"evm">,
  params: SignPreparedCallsParams,
): Promise<SignPreparedCallsResult>;
export async function signPreparedCalls(
  client: InnerWalletApiClient<"solana">,
  params: SolanaSignPreparedCallsParams,
): Promise<SolanaSignPreparedCallsResult>;
export async function signPreparedCalls(
  client: InnerWalletApiClient<Mode>,
  params: SignPreparedCallsParams | SolanaSignPreparedCallsParams,
): Promise<SignPreparedCallsResult | SolanaSignPreparedCallsResult> {
  LOGGER.debug("signPreparedCalls:start", { type: params.type });

  // ── Solana path ──────────────────────────────────────────────────────────
  if (params.type === "solana-transaction-v0") {
    const result = await signSolanaTransaction(
      client as InnerWalletApiClient<"solana">,
      params as SolanaPrepareCallsResult,
    );
    LOGGER.debug("signPreparedCalls:solana:ok");
    return result;
  }

  // ── EVM path ─────────────────────────────────────────────────────────────
  const evmClient = client as InnerWalletApiClient<"evm">;
  const evmParams = params as SignPreparedCallsParams;

  const signAuthorizationCall = async (call: AuthorizationCall) => {
    const { signatureRequest: _signatureRequest, ...rest } = call;

    const signature = await signSignatureRequest(evmClient, {
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

    const signature = await signSignatureRequest(evmClient, signatureRequest);
    const res = {
      ...rest,
      signature,
    } as const;
    LOGGER.debug("signPreparedCalls:userOp:ok");
    return res;
  };

  if (evmParams.type === "array") {
    const res = {
      type: "array" as const,
      data: await Promise.all(
        evmParams.data.map((call) =>
          call.type === "authorization"
            ? signAuthorizationCall(call)
            : signUserOperationCall(call),
        ),
      ),
    };
    LOGGER.debug("signPreparedCalls:array:ok", { count: res.data.length });
    return res;
  } else if (
    evmParams.type === "user-operation-v060" ||
    evmParams.type === "user-operation-v070"
  ) {
    const res = await signUserOperationCall(evmParams);
    LOGGER.debug("signPreparedCalls:single-userOp:ok");
    return res;
  } else if (evmParams.type === "authorization") {
    const { signatureRequest: _signatureRequest, ...rest } = evmParams;
    const signature = await signSignatureRequest(evmClient, {
      type: "eip7702Auth",
      data: {
        ...rest.data,
        chainId: evmParams.chainId,
      },
    });
    const res = { ...rest, signature };
    LOGGER.debug("signPreparedCalls:single-authorization:ok");
    return res;
  } else if (evmParams.type === "paymaster-permit") {
    LOGGER.warn("signPreparedCalls:invalid-call-type", {
      type: evmParams.type,
    });
    throw new BaseError(
      `Invalid call type ${evmParams.type} for signing prepared calls`,
    );
  } else {
    LOGGER.warn("signPreparedCalls:unexpected-call-type", {
      type: (evmParams as { type?: unknown }).type,
    });
    return assertNever(
      evmParams,
      `Unexpected call type in ${evmParams} for signing prepared calls`,
    );
  }
}
