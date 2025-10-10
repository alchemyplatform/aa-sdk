import { getConnectorClient, type Config } from "@wagmi/core";
import { type Hex, type Prettify } from "viem";
import { assertSmartWalletClient } from "@alchemy/wallet-apis";
import type { ConnectorParameter } from "@wagmi/core/internal";
import type { ViemEncodedPreparedCalls } from "../utils/viemEncode.js";

export type SendPreparedCallsParameters = Prettify<
  ViemEncodedPreparedCalls & ConnectorParameter
>;

export type SendPreparedCallsReturnType = Prettify<{
  id: Hex;
}>;

/**
 * Signs and sends prepared calls.
 *
 * This function takes prepared calls (from `prepareSwap` or `prepareCalls`), signs them,
 * and executes the transaction. Returns prepared call IDs that can be used to track the
 * execution status.
 *
 * Notice: If you do not wish to inspect the prepared call data, you can
 * simply use `sendCalls` instead, which combines preparing, signing, and
 * sending in a single action.
 *
 * @param {Config} config - The Wagmi config
 * @param {SendPreparedCallsParameters} parameters - Prepared calls result and optional connector
 * @returns {Promise<SubmitSwapReturnType>} Promise that resolves with prepared call IDs for tracking execution status
 * @throws {Error} Throws if the wallet is not an Alchemy smart wallet
 */
export async function sendPreparedCalls(
  config: Config,
  parameters: SendPreparedCallsParameters,
): Promise<SendPreparedCallsReturnType> {
  const { connector, ...params } = parameters;

  const client = await getConnectorClient(config, {
    chainId: "chainId" in params ? params.chainId : undefined,
    connector,
  });
  assertSmartWalletClient(
    client,
    "'sendPreparedCalls' action must be used with an Alchemy smart wallet",
  );

  // @ts-ignore TODO(jh): we now need to reverse all of the transformations that we did in `prepareSwap`...
  const signed = await client.signPreparedCalls(params);

  const { preparedCallIds } = await client.sendPreparedCalls(signed);

  return {
    id: preparedCallIds[0],
  };
}
