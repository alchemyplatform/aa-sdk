import type { WaitForCallsStatusParameters } from "viem";
import { waitForCallsStatus as viemWaitForCallsStatus } from "viem/actions";
import type { InnerWalletApiClient } from "../../types.js";
import { metrics } from "../../metrics.js";

export async function waitForCallsStatus(
  client: InnerWalletApiClient,
  params: WaitForCallsStatusParameters,
) {
  metrics.trackEvent({
    name: "wait_for_calls_status",
  });

  return viemWaitForCallsStatus(client, params);
}
