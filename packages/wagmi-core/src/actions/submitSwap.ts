import { getConnectorClient, type Config } from "@wagmi/core";
import { hexToNumber, type Hex, type Prettify } from "viem";
import {
  assertSmartWalletClient,
  type PrepareCallsResult,
} from "@alchemy/wallet-apis";
import type { ConnectorParameter } from "@wagmi/core/internal";

export type SubmitSwapParameters = Prettify<
  // TODO(v5): Consider if we want to transform the `PrepareCallsResult` or just pass it through as-is.
  PrepareCallsResult & ConnectorParameter
>;

export type SubmitSwapReturnType = Prettify<{
  /** Prepared call ids. Can be used to track calls status. */
  ids: Hex[];
}>;

/**
 * Submit and execute a token swap using prepared calls.
 *
 * This function takes prepared calls (from `prepareSwap`), signs them, and executes the
 * swap transaction. Returns prepared call IDs that can be used to track the execution status.
 *
 * @param {Config} config - The Wagmi config
 * @param {SubmitSwapParameters} parameters - Prepared calls result from `prepareSwap` and optional connector
 * @returns {Promise<SubmitSwapReturnType>} Promise that resolves with prepared call IDs for tracking execution status
 * @throws {Error} Throws if the wallet is not an Alchemy smart wallet
 */
export async function submitSwap(
  config: Config,
  parameters: SubmitSwapParameters,
): Promise<SubmitSwapReturnType> {
  const { connector, ...params } = parameters;

  const client = await getConnectorClient(config, {
    chainId:
      "chainId" in params && params.chainId
        ? hexToNumber(params.chainId)
        : undefined,
    connector,
  });
  assertSmartWalletClient(
    client,
    "'submitSwap' action must be used with an Alchemy smart wallet",
  );

  const signed = await client.signPreparedCalls(params);

  const { preparedCallIds } = await client.sendPreparedCalls(signed);

  return {
    ids: preparedCallIds,
  };
}
