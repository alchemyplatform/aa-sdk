import { getConnectorClient, type Config } from "@wagmi/core";
import { type Hex, type Prettify } from "viem";
import {
  assertSmartWalletClient,
  viemDecodePreparedCalls,
  type ViemEncodedPreparedCalls,
} from "@alchemy/wallet-apis/internal";
import type { ConnectorParameter } from "@wagmi/core/internal";
import { getAction } from "viem/utils";
import {
  sendPreparedCalls as sendPreparedCallsClientAction,
  signPreparedCalls as signPreparedCallsClientAction,
  type SendPreparedCallsResult,
} from "@alchemy/wallet-apis";
import { LOGGER } from "../logger.js";

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
 * and executes the transaction. Returns a call ID that can be used to track the
 * execution status.
 *
 * Notice: If you do not wish to inspect the prepared call data, you can
 * simply use `sendCalls` instead, which combines preparing, signing, and
 * sending in a single action.
 *
 * @param {Config} config - The Wagmi config
 * @param {SendPreparedCallsParameters} parameters - Prepared calls result and optional connector
 * @returns {Promise<SendPreparedCallsReturnType>} Promise that resolves to an object containing the call ID for tracking execution status
 * @throws {Error} Throws if the wallet is not an Alchemy smart wallet
 */
export async function sendPreparedCalls(
  config: Config,
  parameters: SendPreparedCallsParameters,
): Promise<SendPreparedCallsReturnType> {
  const { connector, ...params } = parameters;

  LOGGER.info("sendPreparedCalls:start", { type: params.type });

  const client = await getConnectorClient(config, {
    chainId: "chainId" in params ? params.chainId : undefined,
    connector,
  });
  assertSmartWalletClient(
    client,
    "'sendPreparedCalls' action must be used with an Alchemy smart wallet",
  );

  const apiParams = viemDecodePreparedCalls(params);

  const signPreparedCallsAction = getAction(
    client,
    signPreparedCallsClientAction,
    "signPreparedCalls",
  );

  const signed = await signPreparedCallsAction(apiParams);

  const sendPreparedCallsAction = getAction(
    client,
    sendPreparedCallsClientAction,
    "sendPreparedCalls",
  );

  // The RPC types package still uses the old `preparedCallIds` shape;
  // the API now returns `{ id }` instead.
  const { id } = (await sendPreparedCallsAction(
    signed,
  )) as unknown as SendPreparedCallsResult;

  LOGGER.info("sendPreparedCalls:success", { id });
  return {
    id,
  };
}
