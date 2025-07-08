import type { InnerWalletApiClient } from "../../types.ts";
import type { Static } from "@sinclair/typebox";
import { wallet_getCallsStatus } from "@alchemy/wallet-api-types/rpc";

export type GetCallsStatusParams = Static<
  typeof wallet_getCallsStatus
>["Request"]["params"][0];

export type GetCallsStatusResult = Static<
  typeof wallet_getCallsStatus
>["ReturnType"];

/**
 * Gets the status of a prepared call by its ID.
 * This method is used to check the execution status of calls sent via sendPreparedCalls.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {GetCallsStatusParams} params - The ID of the prepared call to check
 * @returns {Promise<GetCallsStatusResult>} A Promise that resolves to the status information including:
 *   - id: The hex ID of the call
 *   - chainId: The chain ID in hex format
 *   - status: The current status of the batch execution
 *   - receipts: Optional array of transaction receipts if the batch has been executed
 *
 * @example
 * // After sending prepared calls
 * const sendResult = await client.sendPreparedCalls({...});
 *
 * // Check the status of the first call ID
 * const status = await client.getCallsStatus(sendResult.preparedCallIds[0]);
 */
export async function getCallsStatus(
  client: InnerWalletApiClient,
  params: GetCallsStatusParams,
): Promise<GetCallsStatusResult> {
  return await client.request({
    method: "wallet_getCallsStatus",
    params: [params],
  });
}
