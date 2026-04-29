import type { Hex } from "viem";
import { BaseError } from "@alchemy/common";
import type { InnerSolanaWalletApiClient } from "../../types.js";
import { LOGGER } from "../../logger.js";
import { wallet_getCallsStatus as MethodSchema } from "@alchemy/wallet-api-types/rpc";
import { methodSchema, decode, type MethodResponse } from "../../utils/schema.js";

const schema = methodSchema(MethodSchema);
type GetCallsStatusResponse = MethodResponse<typeof MethodSchema>;

type SolanaGetCallsStatusResponse = Exclude<
  GetCallsStatusResponse,
  { details: unknown }
>;

function isSolanaResponse(
  response: GetCallsStatusResponse,
): response is SolanaGetCallsStatusResponse {
  return !("details" in response);
}

export type SolanaGetCallsStatusParams = {
  id: Hex;
};

export type SolanaGetCallsStatusResult = Omit<
  SolanaGetCallsStatusResponse,
  "status"
> & {
  status: "pending" | "success" | "failure";
  statusCode: number;
};

/**
 * Gets the status of a Solana call bundle.
 *
 * @param {InnerSolanaWalletApiClient} client - The Solana wallet API client
 * @param {SolanaGetCallsStatusParams} params - The call ID to check
 * @returns {Promise<SolanaGetCallsStatusResult>} The status of the call
 */
export async function getCallsStatus(
  client: InnerSolanaWalletApiClient,
  params: SolanaGetCallsStatusParams,
): Promise<SolanaGetCallsStatusResult> {
  LOGGER.debug("solana:getCallsStatus:start", { id: params.id });

  const rpcResp = await client.request({
    method: "wallet_getCallsStatus",
    params: [params.id],
  });

  const fullDecoded = decode(schema.response, rpcResp);

  if (!isSolanaResponse(fullDecoded)) {
    throw new BaseError(
      `Unexpected EVM response from Solana getCallsStatus`,
    );
  }

  const decoded = fullDecoded;
  const statusCode = decoded.status;
  const status = (() => {
    if (statusCode >= 100 && statusCode < 200) return "pending" as const;
    if (statusCode >= 200 && statusCode < 300) return "success" as const;
    if (statusCode >= 300 && statusCode < 700) return "failure" as const;
    throw new BaseError(`Unknown Solana call status code: ${statusCode}`);
  })();

  LOGGER.debug("solana:getCallsStatus:done", { status, statusCode });

  return {
    ...decoded,
    status,
    statusCode,
  };
}
