import { getConnectorClient, type Config } from "@wagmi/core";
import {
  hexToNumber,
  type Address,
  type Hex,
  type Prettify,
  type UnionOmit,
} from "viem";
import {
  type RequestQuoteV0Params,
  swapActions,
} from "@alchemy/wallet-apis/experimental";
import { assertSmartWalletClient } from "@alchemy/wallet-apis";
import type { ConnectorParameter } from "@wagmi/core/internal";

export type SwapParameters = Prettify<
  UnionOmit<RequestQuoteV0Params<Address>, "returnRawCalls"> &
    ConnectorParameter
>;

export type SwapReturnType = Prettify<{
  ids: Hex[]; // prepared call ids, can be used to track status
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
  const { connector, ...params } = parameters;

  // TODO(jh): convert amounts to wei here? what units does wagmi use for other hooks?

  // TODO(jh): all of the values in the input params should prob match what's normal in wagmi,
  // then we should convert them to what the wallet api expects here.

  const chainId = parameters.chainId
    ? hexToNumber(parameters.chainId)
    : undefined;

  const client = await getConnectorClient(config, {
    chainId,
    connector,
  });
  assertSmartWalletClient(
    client,
    "'swap' action must be used with an Alchemy smart wallet",
  );

  const experimentalClient = client.extend(swapActions<Address>);

  const quote = await experimentalClient.requestQuoteV0(params);
  if (quote.rawCalls) {
    throw new Error("Unexpected requestQuote result containing raw calls");
  }

  const signed = await client.signPreparedCalls(quote);

  const { preparedCallIds } = await client.sendPreparedCalls(signed);

  return {
    ids: preparedCallIds,
  };
}
