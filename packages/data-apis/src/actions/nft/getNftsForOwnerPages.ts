import { paginate, type PaginateOptions } from "../../internal/paginate.js";
import type { DataClient } from "../../internal/clientHelpers.js";
import { getNftsForOwner } from "./getNftsForOwner.js";
import type {
  GetNftsForOwnerParams,
  GetNftsForOwnerResult,
} from "../../types.js";

/**
 * Auto-paginating companion to {@link getNftsForOwner}: yields whole pages until the
 * cursor is exhausted (or `maxPages` is hit), guarding against repeated
 * cursors. Iterate items with an inner loop over each page.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetNftsForOwnerParams} params Same params as getNftsForOwner (the cursor is managed for you)
 * @param {PaginateOptions} [options] Abort signal and page cap
 * @returns {AsyncGenerator<GetNftsForOwnerResult, void, undefined>} Pages, in order
 */
export function getNftsForOwnerPages(
  client: DataClient,
  params: GetNftsForOwnerParams,
  options?: PaginateOptions,
): AsyncGenerator<GetNftsForOwnerResult, void, undefined> {
  return paginate({
    fetchPage: (cursor, signal) =>
      getNftsForOwner(client, { ...params, pageKey: cursor }, { signal }),
    nextCursor: (page) => page.pageKey,
    options,
  });
}
