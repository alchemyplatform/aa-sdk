import { paginate, type PaginateOptions } from "../../internal/paginate.js";
import type { DataClient } from "../../internal/clientHelpers.js";
import { getCollectionsForOwner } from "./getCollectionsForOwner.js";
import type {
  GetCollectionsForOwnerParams,
  GetCollectionsForOwnerResult,
} from "../../types.js";

/**
 * Auto-paginating companion to {@link getCollectionsForOwner}: yields whole pages until the
 * cursor is exhausted (or `maxPages` is hit), guarding against repeated
 * cursors. Iterate items with an inner loop over each page.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetCollectionsForOwnerParams} params Same params as getCollectionsForOwner (the cursor is managed for you)
 * @param {PaginateOptions} [options] Abort signal and page cap
 * @returns {AsyncGenerator<GetCollectionsForOwnerResult, void, undefined>} Pages, in order
 */
export function getCollectionsForOwnerPages(
  client: DataClient,
  params: GetCollectionsForOwnerParams,
  options?: PaginateOptions,
): AsyncGenerator<GetCollectionsForOwnerResult, void, undefined> {
  return paginate({
    fetchPage: (cursor, signal) =>
      getCollectionsForOwner(
        client,
        { ...params, pageKey: cursor },
        { signal },
      ),
    nextCursor: (page) => page.pageKey,
    options,
  });
}
