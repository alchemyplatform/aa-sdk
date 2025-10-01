import type { WaitForCallsStatusParameters } from "viem";
import { waitForCallsStatus as viemWaitForCallsStatus } from "viem/actions";
import type { InnerWalletApiClient } from "../../types.js";
import { metrics } from "../../metrics.js";

/**
 * Waits for the status of a prepared call to be updated, returning after the calls are no longer pending.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {WaitForCallsStatusParameters} params - Parameters for waiting for calls status, including the call ID and options for polling.
 * @returns {Promise<WaitForCallsStatusResult>} A Promise that resolves to the result containing the prepared call status, which includes a transaction receipt after the call is executed.
 *
 * @example
 * ```ts
 * const result = await client.waitForCallsStatus({ id: "0x1234..." });
 * console.log(result);
 * ```
 */
export async function waitForCallsStatus(
  client: InnerWalletApiClient,
  params: WaitForCallsStatusParameters,
) {
  metrics.trackEvent({
    name: "wait_for_calls_status",
  });

  return viemWaitForCallsStatus(client, params);
}
