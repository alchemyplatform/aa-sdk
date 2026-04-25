import type { SolanaPrepareCallsResult } from "./prepareCalls.js";
import type { SolanaSendPreparedCallsParams } from "./sendPreparedCalls.js";
import { signSolanaSignatureRequest } from "./signSolanaSignatureRequest.js";
import type { InnerWalletApiClient } from "../types.js";
import { LOGGER } from "../logger.js";

/**
 * Signs a prepared Solana transaction using the client's Ed25519 signer.
 *
 * @param {InnerWalletApiClient<"solana">} client - The Solana wallet client
 * @param {SolanaPrepareCallsResult} prepared - The prepared Solana transaction with signature request
 * @returns {Promise<SolanaSendPreparedCallsParams>} The signed Solana transaction ready for sending
 */
export async function signSolanaPreparedCalls(
  client: InnerWalletApiClient<"solana">,
  prepared: SolanaPrepareCallsResult,
): Promise<SolanaSendPreparedCallsParams> {
  LOGGER.debug("signSolanaPreparedCalls:start");

  const signature = await signSolanaSignatureRequest(
    client.owner,
    prepared.signatureRequest,
  );

  const {
    signatureRequest: _,
    feePayment: __,
    details: ___,
    ...rest
  } = prepared;

  LOGGER.debug("signSolanaPreparedCalls:ok");
  return { ...rest, signature } as SolanaSendPreparedCallsParams;
}
