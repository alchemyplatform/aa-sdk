import {
  toHex,
  type Address,
  type IsUndefined,
  type Prettify,
  type UnionOmit,
} from "viem";
import type { OptionalChainId, InnerWalletApiClient } from "../../types.ts";
import type { WalletServerRpcSchemaType } from "@alchemy/wallet-api-types/rpc";
import { AccountNotFoundError } from "@alchemy/common";
import { mergeClientCapabilities } from "../../utils/capabilities.js";
import { requestWithBreadcrumb } from "@alchemy/common";

type RpcSchema = Extract<
  WalletServerRpcSchemaType,
  {
    Request: {
      method: "wallet_requestQuote_v0";
    };
  }
>;

export type RequestQuoteV0Params<
  TAccount extends Address | undefined = Address | undefined,
> = Prettify<
  OptionalChainId<UnionOmit<RpcSchema["Request"]["params"][0], "from">>
> &
  (IsUndefined<TAccount> extends true ? { from: Address } : { from?: never });

export type RequestQuoteV0Result = Prettify<RpcSchema["ReturnType"]>;

/**
 * Requests a quote for a token swap, returning either prepared calls for smart wallets
 * or raw calls for EOA wallets depending on the returnRawCalls parameter.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {RequestQuoteV0Params<TAccount>} params - Parameters for requesting a swap quote
 * @param {Address} params.fromToken - The address of the token to swap from
 * @param {Address} params.toToken - The address of the token to swap to
 * @param {Hex} [params.fromAmount] - The amount to swap from (mutually exclusive with minimumToAmount)
 * @param {Hex} [params.minimumToAmount] - The minimum amount to receive (mutually exclusive with fromAmount)
 * @param {Address} [params.from] - The address to execute the swap from (required if the client wasn't initialized with an account)
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
 *   fromAmount: "0x1000000000000000000", // 1 ETH
 *   capabilities: {
 *     paymasterService: { policyId: "your-policy-id" }
 *   }
 * });
 *
 * // Request a quote for EOA wallet (raw calls)
 * const rawQuote = await client.requestQuoteV0({
 *   fromToken: "0xA0b86a33E6441e1d6a8E8C7a8E8E8E8E8E8E8E8E",
 *   toToken: "0xB0b86a33E6441e1d6a8E8C7a8E8E8E8E8E8E8E8E",
 *   fromAmount: "0x1000000000000000000",
 *   returnRawCalls: true
 * });
 * ```
 */
export async function requestQuoteV0<
  TAccount extends Address | undefined = Address | undefined,
>(
  client: InnerWalletApiClient,
  params: RequestQuoteV0Params<TAccount>,
): Promise<RequestQuoteV0Result> {
  const from = params.from ?? client.account?.address;
  if (!from) {
    throw new AccountNotFoundError();
  }

  const capabilities = params.returnRawCalls
    ? undefined
    : mergeClientCapabilities(client, params.capabilities);

  return await requestWithBreadcrumb(client as any, {
    method: "wallet_requestQuote_v0",
    params: [
      {
        ...params,
        chainId: params.chainId ?? toHex(client.chain.id),
        from,
        ...(capabilities && { capabilities }),
      },
    ],
  });
}
