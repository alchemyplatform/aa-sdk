import {
  getRpcRequest,
  type DataClient,
} from "../../internal/clientHelpers.js";
import { wrapRpcError } from "../../internal/errors.js";
import type { TokenRpcSchema } from "../../generated/rpc/token.js";
import type {
  GetTokenBalancesParams,
  GetTokenBalancesResult,
} from "../../types.js";

/**
 * Fetches ERC-20 (and native) token balances for an address via the
 * `alchemy_getTokenBalances` JSON-RPC method. Without a `network` override
 * this uses the client's transport; with one, a transport instance is derived
 * for the override network.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetTokenBalancesParams} params Address, token spec, paging options, and optional network override
 * @returns {Promise<GetTokenBalancesResult>} The token balances
 */
export async function getTokenBalances(
  client: DataClient,
  params: GetTokenBalancesParams,
): Promise<GetTokenBalancesResult> {
  const { network, address, tokenSpec, options } = params;
  const request = getRpcRequest(client, network);

  // Positional JSON-RPC params; trailing optionals are omitted when unset.
  // "erc20" is the spec's default tokenSpec, filled in only when paging
  // options are supplied without one.
  const rpcParams: TokenRpcSchema[0]["Parameters"] =
    options !== undefined
      ? [address, tokenSpec ?? "erc20", options]
      : tokenSpec !== undefined
        ? [address, tokenSpec]
        : [address];

  return request({
    method: "alchemy_getTokenBalances",
    params: rpcParams,
  }).catch(wrapRpcError);
}
