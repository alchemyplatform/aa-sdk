import type { Static } from "@sinclair/typebox";
import {
  toHex,
  type Address,
  type IsUndefined,
  type Prettify,
  type UnionOmit,
} from "viem";
import type { wallet_requestQuote_v0 } from "@alchemy/wallet-api-types/rpc";
import type { InnerWalletApiClientBase } from "../../types.js";
import { AccountNotFoundError } from "@aa-sdk/core";
import { mergeClientCapabilities } from "../../internal/capabilities.js";

export type RequestQuoteV0Params<
  TAccount extends Address | undefined = Address | undefined,
> = Prettify<
  UnionOmit<
    Static<
      (typeof wallet_requestQuote_v0)["properties"]["Request"]["properties"]["params"]
    >[0],
    "from" | "chainId"
  >
> &
  (IsUndefined<TAccount> extends true ? { from: Address } : { from?: never });

export type RequestQuoteV0Result = Prettify<
  Static<typeof wallet_requestQuote_v0>["ReturnType"]
>;

export async function requestQuoteV0<
  TAccount extends Address | undefined = Address | undefined,
>(
  client: InnerWalletApiClientBase,
  params: RequestQuoteV0Params<TAccount>,
): Promise<RequestQuoteV0Result> {
  const from = params.from ?? client.account?.address;
  if (!from) {
    throw new AccountNotFoundError();
  }

  const capabilities = params.returnRawCalls
    ? undefined
    : mergeClientCapabilities(client, params.capabilities);

  return await client.request({
    method: "wallet_requestQuote_v0",
    params: [
      {
        ...params,
        chainId: toHex(client.chain.id),
        from,
        ...(capabilities && { capabilities }),
      },
    ],
  });
}
