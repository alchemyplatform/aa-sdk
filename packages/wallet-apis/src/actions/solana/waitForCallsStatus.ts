import type { InnerSolanaWalletApiClient } from "../../types.js";
import {
  getCallsStatus,
  type SolanaGetCallsStatusResult,
} from "./getCallsStatus.js";
import { BaseError } from "@alchemy/common";
import { LOGGER } from "../../logger.js";

export type SolanaWaitForCallsStatusParams = {
  id: `0x${string}`;
  pollingInterval?: number;
  retryCount?: number;
  retryDelay?: (opts: { count: number }) => number;
  status?: (result: SolanaGetCallsStatusResult) => boolean;
  throwOnFailure?: boolean;
  timeout?: number;
};

export type SolanaWaitForCallsStatusResult = SolanaGetCallsStatusResult;

/**
 * Polls getCallsStatus until the call reaches a terminal state.
 * Similar API to viem's waitForCallsStatus with retry, exponential backoff,
 * configurable status predicate, throwOnFailure, and timeout.
 *
 * @param {InnerSolanaWalletApiClient} client - The Solana wallet API client
 * @param {SolanaWaitForCallsStatusParams} params - The call ID and optional polling config
 * @returns {Promise<SolanaWaitForCallsStatusResult>} The final status
 */
export async function waitForCallsStatus(
  client: InnerSolanaWalletApiClient,
  params: SolanaWaitForCallsStatusParams,
): Promise<SolanaWaitForCallsStatusResult> {
  const {
    id,
    pollingInterval = client.pollingInterval,
    retryCount = 4,
    retryDelay = ({ count }: { count: number }) => ~~(1 << count) * 200,
    status: isReady = ({ statusCode }) =>
      statusCode === 200 || statusCode >= 300,
    throwOnFailure = false,
    timeout = 60_000,
  } = params;

  LOGGER.debug("solana:waitForCallsStatus:start", { id });

  const start = Date.now();

  while (Date.now() - start < timeout) {
    let result: SolanaGetCallsStatusResult | undefined;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        result = await getCallsStatus(client, { id });
        break;
      } catch (error) {
        if (attempt >= retryCount) throw error;
        await new Promise((r) => setTimeout(r, retryDelay({ count: attempt })));
      }
    }

    if (!result) throw new BaseError("Unexpected: no result after retries");

    if (throwOnFailure && result.status === "failure") {
      throw new BaseError(
        `Solana call bundle failed with status code ${result.statusCode}`,
      );
    }

    if (isReady(result)) {
      LOGGER.debug("solana:waitForCallsStatus:done", {
        status: result.status,
        statusCode: result.statusCode,
      });
      return result;
    }

    await new Promise((r) => setTimeout(r, pollingInterval));
  }

  throw new BaseError(
    `Timed out while waiting for call bundle with id "${id}" to be confirmed.`,
  );
}
