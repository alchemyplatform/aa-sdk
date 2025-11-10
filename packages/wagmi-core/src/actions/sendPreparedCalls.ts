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
 * and executes the transaction. Returns prepared call IDs that can be used to track the
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

  const {
    // This will only ever contain a single call ID. An upgrade is being planned to
    // wallets apis so that `wallet_sendPreparedCalls` only returns a single ID
    // instead of an array, to align w/ a recent change to EIP-5792.
    preparedCallIds: [id],
  } = await sendPreparedCallsAction(signed);

  LOGGER.info("sendPreparedCalls:success", { id });
  return {
    id,
  };
}
