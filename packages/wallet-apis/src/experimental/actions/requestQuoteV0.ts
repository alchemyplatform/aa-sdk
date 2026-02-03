import type { Address, Hex, Prettify } from "viem";
import type { UserOperation } from "viem/account-abstraction";
import type {
  InnerWalletApiClient,
  SignatureRequest,
  EncodedSignature,
  PrepareCallsCapabilities,
  TypedData,
} from "../../types.ts";
import { AccountNotFoundError } from "@alchemy/common";
import { toRpcRequestQuoteParams } from "../../utils/viemDecode.js";
import { fromRpcRequestQuoteResult } from "../../utils/viemEncode.js";

// ─────────────────────────────────────────────────────────────────────────────
// Action Types
// ─────────────────────────────────────────────────────────────────────────────

export type RequestQuoteV0Params = Prettify<{
  from: {
    address: Address;
    chainId: number;
    amount?: bigint;
  };
  to: {
    address: Address;
    chainId?: number;
    minimumAmount?: bigint;
  };
  sender: Address;
  slippageBps?: number;
  rawCalls?: boolean;
}>;

export type RequestQuoteV0Result =
  | RequestQuoteV0Result_PreparedCalls
  | RequestQuoteV0Result_RawCalls;

// Internal helper types
type UserOperationData =
  | Omit<UserOperation<"0.6">, "signature">
  | Omit<UserOperation<"0.7">, "signature">;

type FeePayment = {
  sponsored: boolean;
  tokenAddress?: Address;
  maxAmount: bigint;
};

export type RequestQuoteV0Result_PreparedCalls = Prettify<{
  quote: {
    fromAmount: bigint;
    minimumToAmount: bigint;
    expiry: bigint;
  };
  chainId: number;
  callId?: Hex;
  rawCalls: false;
  preparedCalls:
    | {
        type: "user-operation-v060";
        chainId: number;
        data: UserOperationData;
        signatureRequest?: SignatureRequest;
        feePayment: FeePayment;
      }
    | {
        type: "user-operation-v070";
        chainId: number;
        data: UserOperationData;
        signatureRequest?: SignatureRequest;
        feePayment: FeePayment;
      }
    | {
        type: "paymaster-permit";
        data: TypedData;
        signatureRequest: SignatureRequest;
        modifiedRequest: {
          from: Address;
          paymasterPermitSignature?: EncodedSignature;
          calls: Array<{ to: Address; data?: Hex; value?: bigint }>;
          capabilities?: PrepareCallsCapabilities;
          chainId: number;
        };
      }
    | {
        type: "array";
        data: Array<
          | {
              type: "user-operation-v060" | "user-operation-v070";
              chainId: number;
              data: UserOperationData;
              signatureRequest?: SignatureRequest;
              feePayment: FeePayment;
            }
          | {
              type: "authorization";
              chainId: number;
              data: { address: Address; nonce: number };
              signatureRequest: SignatureRequest;
            }
        >;
      };
}>;

export type RequestQuoteV0Result_RawCalls = Prettify<{
  quote: {
    fromAmount: bigint;
    minimumToAmount: bigint;
    expiry: bigint;
  };
  chainId: number;
  callId?: Hex;
  rawCalls: true;
  calls: Array<{ to: Address; data?: Hex; value?: bigint }>;
}>;

/**
 * Requests a quote for a token swap, returning either prepared calls for smart wallets
 * or raw calls for EOA wallets depending on the rawCalls parameter.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {RequestQuoteV0Params} params - Parameters for requesting a swap quote
 * @param {object} params.from - The token to swap from
 * @param {Address} params.from.address - The address of the token to swap from
 * @param {number} params.from.chainId - The chain ID for the swap
 * @param {bigint} [params.from.amount] - The amount to swap from (mutually exclusive with to.minimumAmount)
 * @param {object} params.to - The token to swap to
 * @param {Address} params.to.address - The address of the token to swap to
 * @param {number} [params.to.chainId] - The destination chain ID (same chain if omitted)
 * @param {bigint} [params.to.minimumAmount] - The minimum amount to receive (mutually exclusive with from.amount)
 * @param {Address} params.sender - The address executing the swap
 * @param {number} [params.slippageBps] - The maximum acceptable slippage in basis points
 * @param {boolean} [params.rawCalls] - Whether to return raw calls for EOA wallets (defaults to false for smart wallets)
 * @returns {Promise<RequestQuoteV0Result>} A Promise that resolves to either prepared calls or raw calls depending on rawCalls
 *
 * @example
 * ```ts twoslash
 * // Request a quote for smart wallet (prepared calls)
 * const quote = await client.requestQuoteV0({
 *   from: { address: "0xA0b86...", chainId: 1, amount: 1000000000000000000n },
 *   to: { address: "0xB0b86..." },
 *   sender: "0x1234...",
 * });
 *
 * // Request a quote for EOA wallet (raw calls)
 * const rawQuote = await client.requestQuoteV0({
 *   from: { address: "0xA0b86...", chainId: 1, amount: 1000000000000000000n },
 *   to: { address: "0xB0b86..." },
 *   sender: "0x1234...",
 *   rawCalls: true,
 * });
 * ```
 */
export async function requestQuoteV0(
  client: InnerWalletApiClient,
  params: RequestQuoteV0Params,
): Promise<RequestQuoteV0Result> {
  const sender = params.sender ?? client.account?.address;
  if (!sender) {
    throw new AccountNotFoundError();
  }

  // Convert viem-native params to RPC format
  const rpcParams = toRpcRequestQuoteParams({ ...params, sender }, sender);

  const res = await client.request({
    method: "wallet_requestQuote_v0",
    params: [rpcParams],
  });

  // Convert RPC result to viem-native format
  return fromRpcRequestQuoteResult(res);
}
