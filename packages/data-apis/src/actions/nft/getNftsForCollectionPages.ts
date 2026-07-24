import { paginate, type PaginateOptions } from "../../internal/paginate.js";
import type { DataClient } from "../../internal/clientHelpers.js";
import { getNftsForCollection } from "./getNftsForCollection.js";
import type {
  GetNftsForCollectionParams,
  GetNftsForCollectionResult,
} from "../../types.js";

/**
 * Auto-paginating companion to {@link getNftsForCollection}: yields whole pages until the
 * cursor is exhausted (or `maxPages` is hit), guarding against repeated
 * cursors. Iterate items with an inner loop over each page.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetNftsForCollectionParams} params Same params as getNftsForCollection (the cursor is managed for you)
 * @param {PaginateOptions} [options] Abort signal and page cap
 * @returns {AsyncGenerator<GetNftsForCollectionResult, void, undefined>} Pages, in order
 */
export function getNftsForCollectionPages(
  client: DataClient,
  params: GetNftsForCollectionParams,
  options?: PaginateOptions,
): AsyncGenerator<GetNftsForCollectionResult, void, undefined> {
  return paginate({
    fetchPage: (cursor, signal) =>
      getNftsForCollection(
        client,
        { ...params, startToken: cursor },
        { signal },
      ),
    nextCursor: (page) => page.nextToken,
    options,
  });
}
