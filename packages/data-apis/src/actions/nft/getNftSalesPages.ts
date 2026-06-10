import { paginate, type PaginateOptions } from "../../internal/paginate.js";
import type { DataClient } from "../../internal/clientHelpers.js";
import { getNftSales } from "./getNftSales.js";
import type { GetNftSalesParams, GetNftSalesResult } from "../../types.js";

/**
 * Auto-paginating companion to {@link getNftSales}: yields whole pages until the
 * cursor is exhausted (or `maxPages` is hit), guarding against repeated
 * cursors. Iterate items with an inner loop over each page.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetNftSalesParams} params Same params as getNftSales (the cursor is managed for you)
 * @param {PaginateOptions} [options] Abort signal and page cap
 * @returns {AsyncGenerator<GetNftSalesResult, void, undefined>} Pages, in order
 */
export function getNftSalesPages(
  client: DataClient,
  params: GetNftSalesParams,
  options?: PaginateOptions,
): AsyncGenerator<GetNftSalesResult, void, undefined> {
  return paginate({
    fetchPage: (cursor, signal) =>
      getNftSales(client, { ...params, pageKey: cursor }, { signal }),
    nextCursor: (page) => page.pageKey,
    options,
  });
}
