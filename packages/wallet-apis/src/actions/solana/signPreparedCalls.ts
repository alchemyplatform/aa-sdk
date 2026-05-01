import type { Prettify } from "viem";
import type { InnerSolanaWalletApiClient } from "../../types.js";
import {
  signSolanaSignatureRequest,
  type SolanaSignatureResult,
} from "./signSignatureRequest.js";
import type { SolanaPrepareCallsResult } from "./prepareCalls.js";
import { LOGGER } from "../../logger.js";

export type SolanaSignPreparedCallsParams = Prettify<SolanaPrepareCallsResult>;

export type SolanaSignPreparedCallsResult = Prettify<
  Omit<
    SolanaPrepareCallsResult,
    "signatureRequest" | "feePayment" | "details"
  > & {
    signature: SolanaSignatureResult;
  }
>;

/**
 * Signs a prepared Solana transaction using the client's Ed25519 signer.
 *
 * @param {InnerSolanaWalletApiClient} client - The Solana wallet client
 * @param {SolanaSignPreparedCallsParams} params - The prepared Solana transaction with signature request
 * @returns {Promise<SolanaSignPreparedCallsResult>} The signed Solana transaction
 *
 * @example
 * ```ts
 * const prepared = await client.prepareCalls({ ... });
 * const signed = await client.signPreparedCalls(prepared);
 * const result = await client.sendPreparedCalls(signed);
 * ```
 */
export async function signPreparedCalls(
  client: InnerSolanaWalletApiClient,
  params: SolanaSignPreparedCallsParams,
): Promise<SolanaSignPreparedCallsResult> {
  LOGGER.debug("solana:signPreparedCalls:start");

  const signature = await signSolanaSignatureRequest(
    client.owner,
    params.signatureRequest,
  );

  const { signatureRequest: _, feePayment: __, details: ___, ...rest } = params;

  LOGGER.debug("solana:signPreparedCalls:done");
  return { ...rest, signature };
}
