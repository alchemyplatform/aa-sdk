import { getConnectorClient, type Config } from "@wagmi/core";
import {
  toHex,
  type Address,
  type Capabilities,
  type Hex,
  type Prettify,
} from "viem";
import { swapActions } from "@alchemy/wallet-apis/experimental";
import { assertSmartWalletClient } from "@alchemy/wallet-apis";
import type { ConnectorParameter } from "@wagmi/core/internal";
import {
  transformPreparedCalls,
  type TransformedPreparedCalls,
} from "../utils/transforms.js";

export type PrepareSwapParameters = Prettify<
  {
    chainId?: number;
    fromToken: Address;
    toToken: Address;
    slippageBps?: bigint;
    postCalls?: { to: Address; data?: Hex; value?: bigint }[];
    capabilities?: Capabilities;
  } & ({ fromAmount: bigint } | { minimumToAmount: bigint }) &
    ConnectorParameter
>;

export type PrepareSwapReturnType = Prettify<
  TransformedPreparedCalls & {
    quote: {
      fromAmount: bigint;
      minimumToAmount: bigint;
      expiry: Date;
    };
  }
>;

/**
 * Prepare a token swap by requesting a quote and returning the quote and prepared calls.
 *
 * This function requests a swap quote from the wallet APIs and returns the prepared calls
 * along with quote information. The returned prepared calls can be used with `submitSwap`
 * to execute the actual swap transaction.
 *
 * @param {Config} config - The Wagmi config
 * @param {PrepareSwapParameters} parameters - Parameters for the swap including token addresses, amounts, slippage, and optional post-calls
 * @returns {Promise<PrepareSwapReturnType>} Promise that resolves with prepared calls and quote information
 * @throws {Error} Throws if the wallet is not an Alchemy smart wallet or if raw calls are returned
 */
export async function prepareSwap(
  config: Config,
  parameters: PrepareSwapParameters,
): Promise<PrepareSwapReturnType> {
  const { connector, chainId, ...params } = parameters;

  const client = await getConnectorClient(config, {
    chainId,
    connector,
  });
  assertSmartWalletClient(
    client,
    "'prepareSwap' action must be used with an Alchemy smart wallet",
  );

  const experimentalClient = client.extend(swapActions<Address>);

  const { quote, ...rest } = await experimentalClient.requestQuoteV0({
    ...params,
    slippage:
      params.slippageBps != null ? toHex(params.slippageBps) : undefined,
    ...("fromAmount" in params
      ? {
          fromAmount: toHex(params.fromAmount),
        }
      : {
          minimumToAmount: toHex(params.minimumToAmount),
        }),
    postCalls: params.postCalls?.map((call) => ({
      ...call,
      value: call.value != null ? toHex(call.value) : undefined,
    })),
    // TODO(jh): probably need to transform capabilites here too from
    // viem-type to wallet client type (i.e. hex to bigint, chain id to number,
    // alchemyPaymasterService to paymasterService).
  });
  if (rest.rawCalls) {
    // This should be impossible since we are not using the `returnRawCalls` option,
    // as we asserted we have an Alchemy smart wallet. The `returnRawCalls` option is
    // for using an EOA wallet, which is currently unsupported since we wouldn't
    // have an auth'd client for making the request to wallet apis.
    throw new Error("Unexpected quote result containing raw calls");
  }
  const { rawCalls: _rawCalls, ...preparedCalls } = rest;

  return {
    quote: {
      fromAmount: BigInt(quote.fromAmount),
      minimumToAmount: BigInt(quote.minimumToAmount),
      expiry: new Date(quote.expiry),
    },
    ...transformPreparedCalls(preparedCalls),
  };
}
