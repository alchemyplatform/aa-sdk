import type { Prettify } from "viem";
import type {
  DistributiveOmit,
  InnerSolanaWalletApiClient,
} from "../../types.js";
import { isSolanaChain } from "../../utils/assertions.js";
import type { SolanaChainId } from "@alchemy/wallet-api-types";
import { SolanaPrepareCallsParams as SolanaPrepareCallsSchema } from "@alchemy/wallet-api-types";
import { wallet_prepareCalls as MethodSchema } from "@alchemy/wallet-api-types/rpc";
import type { StaticDecode } from "typebox";
import { BaseError } from "@alchemy/common";
import { LOGGER } from "../../logger.js";
import {
  mergeSolanaClientCapabilities,
  type WithCapabilities,
} from "../../utils/capabilities.js";
import {
  methodSchema,
  encode,
  decode,
  type MethodResponse,
} from "../../utils/schema.js";

const schema = methodSchema(MethodSchema);
type PrepareCallsResponse = MethodResponse<typeof MethodSchema>;

type BaseSolanaPrepareCallsParams = StaticDecode<
  typeof SolanaPrepareCallsSchema
>;

export type SolanaPrepareCallsParams = Prettify<
  WithCapabilities<
    DistributiveOmit<BaseSolanaPrepareCallsParams, "from" | "chainId"> & {
      account?: string;
      chainId?: SolanaChainId;
    }
  >
>;

type SolanaPrepareCallsResponse = Extract<
  PrepareCallsResponse,
  { type: "solana-transaction-v0" }
>;

function isSolanaResponse(
  response: PrepareCallsResponse,
): response is SolanaPrepareCallsResponse {
  return response.type === "solana-transaction-v0";
}

export type SolanaPrepareCallsResult = SolanaPrepareCallsResponse;

/**
 * Prepares Solana instructions for execution by building a versioned transaction.
 * Returns the compiled transaction and a signature request that needs to be signed
 * before submitting to sendPreparedCalls.
 *
 * @param {InnerSolanaWalletApiClient} client - The Solana wallet API client
 * @param {SolanaPrepareCallsParams} params - Parameters for preparing Solana calls
 * @param {Array<{programId: string, accounts?: Array, data: Hex}>} params.calls - Array of Solana instructions
 * @param {string} [params.account] - The Solana address to execute from. Defaults to the signer's address.
 * @param {SolanaChainId} [params.chainId] - The Solana chain ID. Defaults to the client's chain.
 * @param {object} [params.capabilities] - Optional capabilities (e.g. paymaster sponsorship)
 * @returns {Promise<SolanaPrepareCallsResult>} The prepared Solana transaction with signature request
 *
 * @example
 * ```ts
 * const result = await client.prepareCalls({
 *   calls: [{
 *     programId: "11111111111111111111111111111111",
 *     data: "0x...",
 *   }],
 *   capabilities: {
 *     paymaster: { policyId: "your-policy-id" }
 *   }
 * });
 * ```
 */
export async function prepareCalls(
  client: InnerSolanaWalletApiClient,
  params: SolanaPrepareCallsParams,
): Promise<SolanaPrepareCallsResult> {
  const { account, chainId, capabilities: caps, ...rest } = params;
  const from = account ?? client.solanaAccount;
  if (!isSolanaChain(client.chain)) {
    throw new BaseError("Expected a Solana chain on the client");
  }
  const resolvedChainId = chainId ?? client.chain.solanaChainId;

  const merged = mergeSolanaClientCapabilities(client, caps);
  const capabilities = merged?.paymaster
    ? { paymasterService: merged.paymaster }
    : undefined;

  LOGGER.debug("solana:prepareCalls:start", {
    callsCount: params.calls?.length,
    hasCapabilities: !!caps,
  });

  const rpcParams = encode(SolanaPrepareCallsSchema, {
    ...rest,
    chainId: resolvedChainId,
    from,
    capabilities,
  });

  const rpcResp = await client.request({
    method: "wallet_prepareCalls",
    params: [rpcParams],
  });

  LOGGER.debug("solana:prepareCalls:done");
  const decoded = decode(schema.response, rpcResp);

  if (!isSolanaResponse(decoded)) {
    throw new BaseError(
      `Unexpected EVM response from Solana prepareCalls: ${decoded.type}`,
    );
  }

  return decoded;
}
