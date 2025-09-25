import { getConnectorClient, type Config } from "@wagmi/core";
import {
  toHex,
  type Address,
  type Capabilities,
  type Chain,
  type Hex,
  type Prettify,
} from "viem";
import { swapActions } from "@alchemy/wallet-apis/experimental";
import { assertSmartWalletClient } from "@alchemy/wallet-apis";
import type { ConnectorParameter } from "@wagmi/core/internal";

export type SwapParameters = Prettify<
  {
    chain?: Chain;
    fromToken: Address;
    toToken: Address;
    slippageBps?: bigint;
    postCalls?: { to: Address; data?: Hex; value?: bigint }[];
    capabilities?: Capabilities;
  } & ({ fromAmount: bigint } | { minimumToAmount: bigint }) &
    ConnectorParameter
>;

export type SwapReturnType = Prettify<{
  /** Prepared call ids. Can be used to track calls status. */
  ids: Hex[];
}>;

/**
 * Execute a token swap using the wallet's prepared calls functionality.
 *
 * Requests a quote for the swap, signs the prepared calls, and executes the swap transaction.
 * Returns prepared call IDs that can be used to track the status of the swap.
 *
 * @param {Config} config - The Wagmi config
 * @param {SwapParameters} parameters - Parameters for the swap request including token addresses, amounts, and optional connector
 * @returns {Promise<SwapReturnType>} Promise that resolves with prepared call IDs for tracking swap status
 * @throws {Error} Throws if raw calls are returned (EOA wallets not yet supported)
 */
export async function swap(
  config: Config,
  parameters: SwapParameters,
): Promise<SwapReturnType> {
  const { connector, chain, ...params } = parameters;

  const client = await getConnectorClient(config, {
    chainId: chain ? chain.id : undefined,
    connector,
  });
  assertSmartWalletClient(
    client,
    "'swap' action must be used with an Alchemy smart wallet",
  );

  const experimentalClient = client.extend(swapActions<Address>);

  const quote = await experimentalClient.requestQuoteV0({
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
  });
  if (quote.rawCalls) {
    throw new Error("Unexpected requestQuote result containing raw calls");
  }

  const signed = await client.signPreparedCalls(quote);

  const { preparedCallIds } = await client.sendPreparedCalls(signed);

  return {
    ids: preparedCallIds,
  };
}
