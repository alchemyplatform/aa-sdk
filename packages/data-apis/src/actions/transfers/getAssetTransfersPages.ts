import { paginate, type PaginateOptions } from "../../internal/paginate.js";
import type { DataClient } from "../../internal/clientHelpers.js";
import { getAssetTransfers } from "./getAssetTransfers.js";
import type {
  GetAssetTransfersParams,
  GetAssetTransfersResult,
} from "../../types.js";

/**
 * Auto-paginating companion to {@link getAssetTransfers}: yields whole pages
 * until the cursor is exhausted (or `maxPages` is hit), guarding against
 * repeated cursors. Note: JSON-RPC requests run through the client's viem
 * transport, which owns the fetch — the abort signal is honored between
 * pages, not mid-request.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetAssetTransfersParams} params Same params as getAssetTransfers (the cursor is managed for you)
 * @param {PaginateOptions} [options] Abort signal (checked between pages) and page cap
 * @returns {AsyncGenerator<GetAssetTransfersResult, void, undefined>} Pages, in order
 */
export function getAssetTransfersPages(
  client: DataClient,
  params: GetAssetTransfersParams,
  options?: PaginateOptions,
): AsyncGenerator<GetAssetTransfersResult, void, undefined> {
  return paginate({
    fetchPage: (pageKey) => getAssetTransfers(client, { ...params, pageKey }),
    nextCursor: (page) => page.pageKey,
    options,
  });
}
