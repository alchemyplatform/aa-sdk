import {
  requestQuoteV0,
  type RequestQuoteV0Params,
  type RequestQuoteV0Result,
} from "./actions/requestQuoteV0.js";
import type { BaseWalletClient, InnerWalletApiClient } from "../types.js";

/**
 * Experimental swap actions for wallet API clients.
 *
 * @remarks
 * > **Experimental**: Swap actions are experimental and may change in a future
 * > release.
 */
export type SwapActions = {
  requestQuoteV0: (
    params: RequestQuoteV0Params,
  ) => Promise<RequestQuoteV0Result>;
};

/**
 * This is a decorator that is used to add experimental swap actions to a client.
 *
 * @remarks
 * > **Experimental**: Swap actions are experimental and may change in a future
 * > release.
 *
 * @param {BaseWalletClient} client The wallet client to extend with swap functionality
 * @returns {SwapActions} An object containing swap-related actions
 */
export const swapActions: (client: BaseWalletClient) => SwapActions = (
  client,
) => {
  // This is safe. It's just needed b/c we have an internal decorator
  // that we don't expose on the public type.
  const _client = client as InnerWalletApiClient;
  return {
    requestQuoteV0: (params) => requestQuoteV0(_client, params),
  };
};
