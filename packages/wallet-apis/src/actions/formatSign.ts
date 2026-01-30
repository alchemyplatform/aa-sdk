import type { WalletServerRpcSchemaType } from "@alchemy/wallet-api-types/rpc";
import type { InnerWalletApiClient, OptionalChainId } from "../types.ts";
import { toHex, type Address, type Prettify } from "viem";
import { AccountNotFoundError } from "@alchemy/common";
import { LOGGER } from "../logger.js";

type RpcSchema = Extract<
  WalletServerRpcSchemaType,
  {
    Request: {
      method: "wallet_formatSign";
    };
  }
>;

export type FormatSignParams = Prettify<
  Omit<OptionalChainId<RpcSchema["Request"]["params"][0]>, "from"> & {
    from?: Address;
  }
>;

export type FormatSignResult = Prettify<RpcSchema["ReturnType"]>;

/**
 * Formats a signature request for signing messages or transactions.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {FormatSignParams} params - Parameters for formatting the signature
 * @returns {Promise<FormatSignResult>} A Promise that resolves to the formatSign result containing the formatted signature.
 *
 * @example
 * ```ts
 * // Formats a signature
 * const result = await client.formatSign({
 *    from: "0x1234...",
 *    signature: {
 *      type: "ecdsa",
 *      data: "0xabcd..."
 *    },
 * });
 * ```
 */
export async function formatSign(
  client: InnerWalletApiClient,
  params: FormatSignParams,
): Promise<FormatSignResult> {
  const from = params.from ?? client.account?.address;
  if (!from) {
    throw new AccountNotFoundError();
  }

  LOGGER.debug("formatSign:start");
  const res = await client.request({
    method: "wallet_formatSign",
    params: [
      { ...params, from, chainId: params.chainId ?? toHex(client.chain.id) },
    ],
  });
  LOGGER.debug("formatSign:done");
  return res;
}
