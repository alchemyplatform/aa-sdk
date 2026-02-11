import type { InnerWalletApiClient } from "../types.js";
import { wallet_getCapabilities as MethodSchema } from "@alchemy/wallet-api-types/rpc";
import type { StaticDecode } from "typebox";
import { Value } from "typebox/value";
import { resolveAddress, type AccountParam } from "../utils/resolve.js";

const schema = {
  requestParams: MethodSchema.properties.Request.properties.params,
  response: MethodSchema.properties.ReturnType,
};

// Runtime types.
type Schema = StaticDecode<typeof MethodSchema>;
type RpcResponse = Schema["ReturnType"];

export type GetCapabilitiesParams = {
  account?: AccountParam;
  chainId?: number;
};

export type GetCapabilitiesResult = Record<number, Record<string, unknown>>;

/**
 * Gets the capabilities supported by the wallet for the given account.
 * Borrowed from viem's `getCapabilities` action and adapted for
 * compatibility with our wallet API transport and RPC schema.
 * Transforms RPC `paymasterService` to `paymaster` for consistency
 * with the SDK's public API.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {GetCapabilitiesParams} [params] - Optional parameters
 * @param {Address} [params.account] - The account address. Defaults to the client's account.
 * @param {number} [params.chainId] - Optional chain ID to filter capabilities for.
 * @returns {Promise<GetCapabilitiesResult>} A mapping from chain ID (number) to capabilities
 *
 * @example
 * ```ts
 * const capabilities = await client.getCapabilities({
 *   account: "0x1234...",
 * });
 * // { 1: { paymaster: { supported: true }, atomic: { status: "supported" } } }
 * ```
 */
export async function getCapabilities(
  client: InnerWalletApiClient,
  params?: GetCapabilitiesParams,
): Promise<GetCapabilitiesResult> {
  const account = params?.account
    ? resolveAddress(params.account)
    : client.account.address;

  const chainId = params?.chainId ?? client?.chain.id;
  const chainIds = chainId != null ? [chainId] : undefined;

  const rpcParams = Value.Encode(
    schema.requestParams,
    chainIds?.length ? [account, chainIds] : [account],
  );

  const rpcResp = await client.request({
    method: "wallet_getCapabilities",
    params: rpcParams,
  });

  const decoded: RpcResponse = Value.Decode(schema.response, rpcResp);

  const result: GetCapabilitiesResult = {};

  for (const [hexChainId, capabilities] of Object.entries(decoded)) {
    const transformed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(capabilities)) {
      // Our paymaster capability interface is non-standard, so we rename it
      // from `paymasterService` to `paymaster` when used in our SDK client.
      if (key === "paymasterService") {
        transformed["paymaster"] = value;
      } else {
        transformed[key] = value;
      }
    }
    result[Number(hexChainId)] = transformed;
  }

  return result;
}
