import type { Address } from "viem";
import {
  requestQuoteV0,
  type RequestQuoteV0Params,
  type RequestQuoteV0Result,
} from "./actions/requestQuoteV0.js";
import type { BaseWalletClient } from "../types.js";

export type SwapActions<
  TAccount extends Address | undefined = Address | undefined,
> = {
  requestQuoteV0: (
    params: RequestQuoteV0Params<TAccount>,
  ) => Promise<RequestQuoteV0Result>;
};

export const swapActions: <
  TAccount extends Address | undefined = Address | undefined,
>(
  client: BaseWalletClient,
) => SwapActions<TAccount> = (client) => ({
  requestQuoteV0: (params) => requestQuoteV0(client, params),
});
