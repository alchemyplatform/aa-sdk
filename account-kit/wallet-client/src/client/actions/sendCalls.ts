import type { Address } from "viem";
import type { InnerWalletApiClient } from "../../types.js";
import { prepareCalls, type PrepareCallsParams } from "./prepareCalls.js";
import { metrics } from "../../metrics.js";
import { signPreparedCalls } from "./signPreparedCalls.js";
import type { SmartAccountSigner } from "@aa-sdk/core";
import {
  sendPreparedCalls,
  type SendPreparedCallsResult,
} from "./sendPreparedCalls.js";

export type SendCallsParams<
  TAccount extends Address | undefined = Address | undefined,
> = PrepareCallsParams<TAccount>;

export type SendCallsResult = SendPreparedCallsResult;

export async function sendCalls<
  TAccount extends Address | undefined = Address | undefined,
>(
  client: InnerWalletApiClient,
  signer: SmartAccountSigner,
  params: SendCallsParams<TAccount>,
): Promise<SendCallsResult> {
  metrics.trackEvent({
    name: "send_calls",
  });

  const calls = await prepareCalls(client, params);

  const signedCalls = await signPreparedCalls(signer, calls);

  return await sendPreparedCalls(client, {
    ...signedCalls,
    // The only capability that is supported in sendPreparedCalls is permissions.
    ...(params.capabilities?.permissions != null
      ? { capabilities: { permissions: params.capabilities.permissions } }
      : {}),
  });
}
