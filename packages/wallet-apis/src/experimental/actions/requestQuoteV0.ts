import type { Address, Prettify } from "viem";
import type { DistributiveOmit, InnerWalletApiClient } from "../../types.ts";
import { AccountNotFoundError } from "@alchemy/common";
import {
  mergeClientCapabilities,
  toRpcCapabilities,
  type PrepareCallsCapabilities,
  type WithCapabilities,
} from "../../utils/capabilities.js";
import { wallet_requestQuote_v0 as MethodSchema } from "@alchemy/wallet-api-types/rpc";
import type { StaticDecode } from "typebox";
import { Value } from "typebox/value";

const schema = {
  request: MethodSchema.properties.Request.properties.params.items[0],
  response: MethodSchema.properties.ReturnType,
};

// Runtime types.
type Schema = StaticDecode<typeof MethodSchema>;
type BaseRequestQuoteV0Params = Schema["Request"]["params"][0];
type RequestQuoteV0Response = Schema["ReturnType"];

export type RequestQuoteV0Params = Prettify<
  WithCapabilities<
    DistributiveOmit<BaseRequestQuoteV0Params, "from" | "chainId"> & {
      from?: Address;
      chainId?: number;
    }
  >
>;

export type RequestQuoteV0Result = RequestQuoteV0Response;

/**
 * Requests a quote for a token swap, returning either prepared calls for smart wallets
 * or raw calls for EOA wallets depending on the returnRawCalls parameter.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {RequestQuoteV0Params} params - Parameters for requesting a swap quote
 * @param {Address} params.fromToken - The address of the token to swap from
 * @param {Address} params.toToken - The address of the token to swap to
 * @param {Hex} [params.fromAmount] - The amount to swap from (mutually exclusive with minimumToAmount)
 * @param {Hex} [params.minimumToAmount] - The minimum amount to receive (mutually exclusive with fromAmount)
 * @param {Address} [params.from] - The address to execute the swap from. Defaults to the client's account (signer address via EIP-7702).
 * @param {Hex} [params.slippage] - The maximum acceptable slippage percentage
 * @param {boolean} [params.returnRawCalls] - Whether to return raw calls for EOA wallets (defaults to false for smart wallets)
 * @param {object} [params.capabilities] - Optional capabilities to include with the request (only available when returnRawCalls is false)
 * @param {Array<{to: Address, data?: Hex, value?: Hex}>} [params.postCalls] - Optional calls to execute after the swap
 * @returns {Promise<RequestQuoteV0Result>} A Promise that resolves to either prepared calls or raw calls depending on returnRawCalls
 *
 * @example
 * ```ts twoslash
 * // Request a quote for smart wallet (prepared calls)
 * const quote = await client.requestQuoteV0({
 *   fromToken: "0xA0b86a33E6441e1d6a8E8C7a8E8E8E8E8E8E8E8E",
 *   toToken: "0xB0b86a33E6441e1d6a8E8C7a8E8E8E8E8E8E8E8E",
 *   fromAmount: 1000000000000000000n, // 1 ETH
 *   capabilities: {
 *     paymaster: { policyId: "your-policy-id" }
 *   }
 * });
 *
 * // Request a quote for EOA wallet (raw calls)
 * const rawQuote = await client.requestQuoteV0({
 *   fromToken: "0xA0b86a33E6441e1d6a8E8C7a8E8E8E8E8E8E8E8E",
 *   toToken: "0xB0b86a33E6441e1d6a8E8C7a8E8E8E8E8E8E8E8E",
 *   fromAmount: 1000000000000000000n,
 *   returnRawCalls: true
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

  const capabilities =
    "returnRawCalls" in params && params.returnRawCalls
      ? undefined
      : mergeClientCapabilities(
          client,
          ("capabilities" in params ? params.capabilities : undefined) as
            | PrepareCallsCapabilities
            | undefined,
        );

  const rpcParams = Value.Encode(schema.request, {
    ...params,
    chainId: params.chainId ?? client.chain.id,
    from,
    ...(capabilities && { capabilities: toRpcCapabilities(capabilities) }),
  } satisfies BaseRequestQuoteV0Params);

  const rpcResp = await client.request({
    method: "wallet_requestQuote_v0",
    params: [rpcParams],
  });

  return Value.Decode(schema.response, rpcResp) satisfies RequestQuoteV0Result;
}
