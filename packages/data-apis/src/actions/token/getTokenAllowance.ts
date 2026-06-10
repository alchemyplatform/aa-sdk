import {
  getRpcRequest,
  type DataClient,
} from "../../internal/clientHelpers.js";
import type {
  GetTokenAllowanceParams,
  GetTokenAllowanceResult,
} from "../../types.js";

/**
 * Fetches the ERC-20 allowance a spender has from an owner via the
 * `alchemy_getTokenAllowance` JSON-RPC method. Without a `network` override
 * this uses the client's transport; with one, a transport instance is derived
 * for the override network.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetTokenAllowanceParams} params Contract, owner, spender, and optional network override
 * @returns {Promise<GetTokenAllowanceResult>} The allowance as a decimal string
 */
export async function getTokenAllowance(
  client: DataClient,
  params: GetTokenAllowanceParams,
): Promise<GetTokenAllowanceResult> {
  const { network, ...allowanceRequest } = params;
  const request = getRpcRequest(client, network);
  return request({
    method: "alchemy_getTokenAllowance",
    params: [allowanceRequest],
  });
}
