import type { InnerWalletApiClient, OptionalChainId } from "../types.ts";
import { toHex, type Address, type IsUndefined, type Prettify } from "viem";
import type { WalletServerRpcSchemaType } from "@alchemy/wallet-api-types/rpc";
import { AccountNotFoundError } from "@alchemy/common";
import { LOGGER } from "../logger.js";

type RpcSchema = Extract<
  WalletServerRpcSchemaType,
  {
    Request: {
      method: "wallet_prepareSign";
    };
  }
>;

export type PrepareSignParams<
  TAccount extends Address | undefined = Address | undefined,
> = Prettify<
  OptionalChainId<Omit<RpcSchema["Request"]["params"][0], "from">> &
    (IsUndefined<TAccount> extends true ? { from: Address } : { from?: never })
>;

export type PrepareSignResult = Prettify<RpcSchema["ReturnType"]>;

/**
 * Prepares a signature request for signing messages or transactions.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {PrepareSignParams} params - Parameters for preparing the signature request
 * @returns {Promise<PrepareSignResult>} A Promise that resolves to the prepare sign result containing a signature request
 *
 * @example
 * ```ts
 * // Prepare a message to be signed
 * const result = await client.prepareSign({
 *    from: "0x1234...",
 *    type: "personal_sign",
 *    data: "Hello, world!",
 * });
 * ```
 */
export async function prepareSign<
  TAccount extends Address | undefined = Address | undefined,
>(
  client: InnerWalletApiClient,
  params: PrepareSignParams<TAccount>,
): Promise<PrepareSignResult> {
  const from = params.from ?? client.account?.address;
  if (!from) {
    LOGGER.warn("prepareSign:no-from", { hasClientAccount: !!client.account });
    throw new AccountNotFoundError();
  }

  LOGGER.debug("prepareSign:start", { type: params.type });
  const res = await client.request({
    method: "wallet_prepareSign",
    params: [
      {
        ...params,
        from,
        chainId: params.chainId ?? toHex(client.chain.id),
      },
    ],
  });
  LOGGER.debug("prepareSign:done");
  return res;
}
