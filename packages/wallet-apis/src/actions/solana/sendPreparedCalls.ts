import type { Prettify } from "viem";
import type { InnerSolanaWalletApiClient } from "../../types.js";
import { PreparedCall_SolanaV0_Signed as PreparedCall_SolanaV0_SignedSchema } from "@alchemy/wallet-api-types";
import type { StaticDecode } from "typebox";
import { BaseError } from "@alchemy/common";
import { LOGGER } from "../../logger.js";
import { wallet_sendPreparedCalls as MethodSchema } from "@alchemy/wallet-api-types/rpc";
import {
  methodSchema,
  encode,
  decodeSolanaResponse,
  type MethodResponse,
} from "../../utils/schema.js";

const schema = methodSchema(MethodSchema);
type SendPreparedCallsResponse = MethodResponse<typeof MethodSchema>;

export type SolanaSendPreparedCallsParams = Prettify<
  StaticDecode<typeof PreparedCall_SolanaV0_SignedSchema>
>;

type SolanaSendPreparedCallsResponse = Extract<
  SendPreparedCallsResponse,
  { details: { type: "solana-transaction-v0" } }
>;

export type SolanaSendPreparedCallsResult = SolanaSendPreparedCallsResponse;

function isSolanaResponse(
  response: SendPreparedCallsResponse,
): response is SolanaSendPreparedCallsResult {
  return response.details.type === "solana-transaction-v0";
}

/**
 * Sends a signed Solana transaction.
 * This method is used after signing the signature request returned from prepareCalls.
 *
 * @param {InnerSolanaWalletApiClient} client - The Solana wallet API client
 * @param {SolanaSendPreparedCallsParams} params - The signed Solana transaction
 * @returns {Promise<SolanaSendPreparedCallsResult>} The result containing the call ID
 */
export async function sendPreparedCalls(
  client: InnerSolanaWalletApiClient,
  params: SolanaSendPreparedCallsParams,
): Promise<SolanaSendPreparedCallsResult> {
  LOGGER.debug("solana:sendPreparedCalls:start", { type: params.type });

  const rpcParams = encode(PreparedCall_SolanaV0_SignedSchema, params);
  const rpcResp = await client.request({
    method: "wallet_sendPreparedCalls",
    params: [rpcParams],
  });

  LOGGER.debug("solana:sendPreparedCalls:done");
  const decoded = decodeSolanaResponse(schema.response, rpcResp);

  if (!isSolanaResponse(decoded)) {
    throw new BaseError(
      `Unexpected EVM response from Solana sendPreparedCalls: ${decoded.details.type}`,
    );
  }

  return decoded;
}
