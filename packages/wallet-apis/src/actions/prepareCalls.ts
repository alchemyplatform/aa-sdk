import type { Address, Prettify } from "viem";
import type {
  DistributiveOmit,
  InnerWalletApiClient,
  Mode,
  SolanaChainDef,
  SolanaSigner,
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

// ── EVM types ────────────────────────────────────────────────────────────────

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

// ── Solana types ─────────────────────────────────────────────────────────────

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

// ── Overloads ────────────────────────────────────────────────────────────────

export async function prepareCalls(
  client: InnerWalletApiClient<"evm">,
  params: PrepareCallsParams,
): Promise<PrepareCallsResult>;
export async function prepareCalls(
  client: InnerWalletApiClient<"solana">,
  params: SolanaPrepareCallsParams,
): Promise<SolanaPrepareCallsResult>;
export async function prepareCalls(
  client: InnerWalletApiClient<Mode>,
  params: PrepareCallsParams | SolanaPrepareCallsParams,
): Promise<PrepareCallsResult | SolanaPrepareCallsResult> {
  const isSolana = "solanaChainId" in client.chain;

  const from: string = isSolana
    ? ((params.account as string | undefined) ??
      (client.owner as SolanaSigner).address)
    : params.account
      ? resolveAddress(params.account as Exclude<AccountParam, null>)
      : client.account.address;

  const chainId: number | SolanaChainId = isSolana
    ? ((params.chainId as SolanaChainId | undefined) ??
      (client.chain as SolanaChainDef).solanaChainId)
    : ((params.chainId as number | undefined) ?? client.chain.id);

  const capabilities = mergeClientCapabilities(
    client as InnerWalletApiClient,
    params.capabilities,
  );

  LOGGER.debug("prepareCalls:start", {
    callsCount: params.calls?.length,
    hasCapabilities: !!params.capabilities,
  });

  const rpcParams = isSolana
    ? (() => {
        const {
          account: _,
          chainId: __,
          capabilities: solCaps,
          ...solRest
        } = params as SolanaPrepareCallsParams;
        const solCapabilities = solCaps?.paymaster
          ? { paymasterService: solCaps.paymaster }
          : undefined;
        return encode(schema.request, {
          ...solRest,
          chainId: chainId as SolanaChainId,
          from,
          capabilities: solCapabilities,
        });
      })()
    : (() => {
        const {
          account: _,
          chainId: __,
          ...evmRest
        } = params as PrepareCallsParams;
        return encode(schema.request, {
          ...evmRest,
          chainId: chainId as number,
          from: from as Address,
          capabilities: toRpcCapabilities(capabilities),
        });
      })();

  const rpcResp = await (client as InnerWalletApiClient).request({
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

  return decoded as PrepareCallsResult | SolanaPrepareCallsResult;
}
