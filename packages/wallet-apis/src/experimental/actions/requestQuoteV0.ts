import type { Address, Hex, Prettify } from "viem";
import type { InnerWalletApiClient, Call } from "../../types.ts";
import { AccountNotFoundError } from "@alchemy/common";
import { toRpcRequestQuoteParams } from "../../utils/viemDecode.js";
import {
  fromRpcRequestQuoteResult,
  type PrepareCallsResult_UserOp,
  type PrepareCallsResult_Authorization,
  type PrepareCallsResult_PaymasterPermit,
} from "../../utils/viemEncode.js";

export type RequestQuoteV0Params = Prettify<{
  /** The address of the account executing the swap (consistent with prepareCalls) */
  from: Address;
  /** The chain ID where the swap originates */
  chainId: number;
  /** The address of the source token */
  fromToken: Address;
  /** The address of the destination token */
  toToken: Address;
  /** The amount of source token to swap (mutually exclusive with minimumToAmount) */
  fromAmount?: bigint;
  /** The minimum amount to receive (mutually exclusive with fromAmount) */
  minimumToAmount?: bigint;
  /** The destination chain ID (for cross-chain swaps, defaults to same chain if omitted) */
  toChainId?: number;
  /** Maximum acceptable slippage in basis points */
  slippageBps?: number;
  /** Whether to return raw calls for EOA wallets (defaults to false for smart wallets) */
  rawCalls?: boolean;
}>;

export type RequestQuoteV0Result =
  | RequestQuoteV0Result_PreparedCalls
  | RequestQuoteV0Result_RawCalls;

// Reuse PrepareCallsResult types, omitting `details` which isn't present in quote responses
type QuoteUserOp = Omit<PrepareCallsResult_UserOp, "details">;
type QuoteAuthorization = PrepareCallsResult_Authorization;
type QuotePaymasterPermit = Omit<PrepareCallsResult_PaymasterPermit, "details">;

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
    | QuoteUserOp
    | QuotePaymasterPermit
    | {
        type: "array";
        data: Array<QuoteUserOp | QuoteAuthorization>;
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
  calls: Call[];
}>;

/**
 * Requests a quote for a token swap, returning either prepared calls for smart wallets
 * or raw calls for EOA wallets depending on the rawCalls parameter.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {RequestQuoteV0Params} params - Parameters for requesting a swap quote
 * @param {Address} params.from - The address of the account executing the swap
 * @param {number} params.chainId - The chain ID for the swap
 * @param {Address} params.fromToken - The address of the token to swap from
 * @param {Address} params.toToken - The address of the token to swap to
 * @param {bigint} [params.fromAmount] - The amount to swap (mutually exclusive with minimumToAmount)
 * @param {bigint} [params.minimumToAmount] - The minimum amount to receive (mutually exclusive with fromAmount)
 * @param {number} [params.toChainId] - The destination chain ID (for cross-chain swaps)
 * @param {number} [params.slippageBps] - The maximum acceptable slippage in basis points
 * @param {boolean} [params.rawCalls] - Whether to return raw calls for EOA wallets (defaults to false for smart wallets)
 * @returns {Promise<RequestQuoteV0Result>} A Promise that resolves to either prepared calls or raw calls depending on rawCalls
 *
 * @example
 * ```ts twoslash
 * // Request a quote for smart wallet (prepared calls)
 * const quote = await client.requestQuoteV0({
 *   from: "0x1234...",
 *   chainId: 1,
 *   fromToken: "0xA0b86...",
 *   toToken: "0xB0b86...",
 *   fromAmount: 1000000000000000000n,
 * });
 *
 * // Request a quote for EOA wallet (raw calls)
 * const rawQuote = await client.requestQuoteV0({
 *   from: "0x1234...",
 *   chainId: 1,
 *   fromToken: "0xA0b86...",
 *   toToken: "0xB0b86...",
 *   minimumToAmount: 500000000000000000n,
 *   rawCalls: true,
 * });
 * ```
 */
export async function requestQuoteV0(
  client: InnerWalletApiClient,
  params: RequestQuoteV0Params,
): Promise<RequestQuoteV0Result> {
  const from = params.from ?? client.account?.address;
  if (!from) {
    throw new AccountNotFoundError();
  }

  const rpcParams = toRpcRequestQuoteParams({ ...params, from });

  const res = await client.request({
    method: "wallet_requestQuote_v0",
    params: [rpcParams],
  });

  return fromRpcRequestQuoteResult(res);
}
