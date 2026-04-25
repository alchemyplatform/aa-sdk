import type { Address, Prettify } from "viem";
import type {
  DistributiveOmit,
  InnerWalletApiClient,
  Mode,
  SolanaChainDef,
} from "../types.ts";
import type { SolanaChainId } from "@alchemy/wallet-api-types";
import {
  PrepareCallsParams as EvmPrepareCallsSchema,
  SolanaPrepareCallsParams as SolanaPrepareCallsSchema,
  PreparedCall_SolanaV0 as PreparedCall_SolanaV0Schema,
} from "@alchemy/wallet-api-types";
import type { StaticDecode } from "typebox";
import { LOGGER } from "../logger.js";
import {
  fromRpcCapabilities,
  mergeClientCapabilities,
  toRpcCapabilities,
  type PrepareCallsCapabilities,
  type WithCapabilities,
} from "../utils/capabilities.js";
import { resolveAddress, type AccountParam } from "../utils/resolve.js";
import { wallet_prepareCalls as MethodSchema } from "@alchemy/wallet-api-types/rpc";
import {
  methodSchema,
  encode,
  decode,
  type MethodResponse,
} from "../utils/schema.js";

const schema = methodSchema(MethodSchema);
type PrepareCallsResponse = MethodResponse<typeof MethodSchema>;

type EvmBasePrepareCallsParams = StaticDecode<typeof EvmPrepareCallsSchema>;

export type PrepareCallsParams = Prettify<
  WithCapabilities<
    DistributiveOmit<EvmBasePrepareCallsParams, "from" | "chainId"> & {
      account?: AccountParam;
      chainId?: number;
    }
  >
>;

type ClientModifiedRequest = Prettify<
  Omit<EvmBasePrepareCallsParams, "from" | "capabilities"> & {
    account: Address;
    capabilities?: PrepareCallsCapabilities;
  }
>;

type EvmPrepareCallsResponse = Exclude<
  PrepareCallsResponse,
  { type: "solana-transaction-v0" }
>;

export type PrepareCallsResult =
  | Exclude<EvmPrepareCallsResponse, { type: "paymaster-permit" }>
  | (Omit<
      Extract<EvmPrepareCallsResponse, { type: "paymaster-permit" }>,
      "modifiedRequest"
    > & {
      modifiedRequest: ClientModifiedRequest;
    });

type SolanaBasePrepareCallsParams = StaticDecode<
  typeof SolanaPrepareCallsSchema
>;

export type SolanaPrepareCallsParams = Prettify<
  WithCapabilities<
    DistributiveOmit<SolanaBasePrepareCallsParams, "from" | "chainId"> & {
      account?: string;
      chainId?: SolanaChainId;
    }
  >
>;

export type SolanaPrepareCallsResult = StaticDecode<
  typeof PreparedCall_SolanaV0Schema
>;

/**
 * Prepares a set of contract calls for execution by building a user operation.
 * Returns the built user operation and a signature request that needs to be signed
 * before submitting to sendPreparedCalls.
 *
 * The client defaults to using EIP-7702 with the signer's address, so you can call
 * this directly without first calling `requestAccount`.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {PrepareCallsParams} params - Parameters for preparing calls
 * @param {Array<{to: Address, data?: Hex, value?: bigint}>} params.calls - Array of contract calls to execute
 * @param {AccountParam} [params.account] - The account to execute the calls from. Can be an address string or an object with an `address` property. Defaults to the client's account (signer address via EIP-7702).
 * @param {object} [params.capabilities] - Optional capabilities to include with the request
 * @returns {Promise<PrepareCallsResult>} A Promise that resolves to the prepared calls result containing
 * the user operation data and signature request
 *
 * @example
 * ```ts
 * // Prepare a sponsored user operation call (uses signer address via EIP-7702 by default)
 * const result = await client.prepareCalls({
 *   calls: [{
 *     to: "0x1234...",
 *     data: "0xabcdef...",
 *     value: 0n
 *   }],
 *   capabilities: {
 *     paymaster: { policyId: "your-policy-id" }
 *   }
 * });
 * ```
 */
export async function prepareCalls(
  client: InnerWalletApiClient<"evm">,
  params: PrepareCallsParams,
): Promise<PrepareCallsResult>;

/**
 * Prepares Solana instructions for execution by building a versioned transaction.
 * Returns the compiled transaction and a signature request that needs to be signed
 * before submitting to sendPreparedCalls.
 *
 * @param {InnerWalletApiClient<"solana">} client - The Solana wallet API client
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
  client: InnerWalletApiClient<"solana">,
  params: SolanaPrepareCallsParams,
): Promise<SolanaPrepareCallsResult>;

export async function prepareCalls(
  client: InnerWalletApiClient<Mode>,
  params: PrepareCallsParams | SolanaPrepareCallsParams,
): Promise<PrepareCallsResult | SolanaPrepareCallsResult> {
  if ("solanaChainId" in client.chain) {
    return prepareSolanaCalls(
      client as InnerWalletApiClient<"solana">,
      params as SolanaPrepareCallsParams,
    );
  }

  return prepareEvmCalls(
    client as InnerWalletApiClient,
    params as PrepareCallsParams,
  );
}

async function prepareSolanaCalls(
  client: InnerWalletApiClient<"solana">,
  params: SolanaPrepareCallsParams,
): Promise<SolanaPrepareCallsResult> {
  const { account, chainId, capabilities: caps, ...rest } = params;
  const from = account ?? client.owner.address;
  const resolvedChainId =
    chainId ?? (client.chain as SolanaChainDef).solanaChainId;
  const capabilities = caps?.paymaster
    ? { paymasterService: caps.paymaster }
    : undefined;

  LOGGER.debug("prepareCalls:start", {
    callsCount: params.calls?.length,
    hasCapabilities: !!caps,
  });

  const rpcParams = encode(schema.request, {
    ...rest,
    chainId: resolvedChainId,
    from,
    capabilities,
  });

  const rpcResp = await (client as unknown as InnerWalletApiClient).request({
    method: "wallet_prepareCalls",
    params: [rpcParams],
  });

  LOGGER.debug("prepareCalls:done");
  return decode(schema.response, rpcResp) as SolanaPrepareCallsResult;
}

async function prepareEvmCalls(
  client: InnerWalletApiClient,
  params: PrepareCallsParams,
): Promise<PrepareCallsResult> {
  const from = params.account
    ? resolveAddress(params.account)
    : client.account.address;
  const chainId = params.chainId ?? client.chain.id;
  const capabilities = mergeClientCapabilities(client, params.capabilities);

  LOGGER.debug("prepareCalls:start", {
    callsCount: params.calls?.length,
    hasCapabilities: !!params.capabilities,
  });

  const { account: _, chainId: __, ...rest } = params;
  const rpcParams = encode(schema.request, {
    ...rest,
    chainId,
    from,
    capabilities: toRpcCapabilities(capabilities),
  });

  const rpcResp = await client.request({
    method: "wallet_prepareCalls",
    params: [rpcParams],
  });

  LOGGER.debug("prepareCalls:done");
  const decoded = decode(schema.response, rpcResp);

  if (decoded.type === "paymaster-permit") {
    const { from, capabilities, ...restModifiedRequest } =
      decoded.modifiedRequest;
    return {
      ...decoded,
      modifiedRequest: {
        ...restModifiedRequest,
        account: from,
        capabilities: fromRpcCapabilities(capabilities),
      },
    } as PrepareCallsResult;
  }

  return decoded as PrepareCallsResult;
}
