import { paginate, type PaginateOptions } from "../../internal/paginate.js";
import type { DataClient } from "../../internal/clientHelpers.js";
import { getContractsForOwner } from "./getContractsForOwner.js";
import type {
  GetContractsForOwnerParams,
  GetContractsForOwnerResult,
} from "../../types.js";

/**
 * Auto-paginating companion to {@link getContractsForOwner}: yields whole pages until the
 * cursor is exhausted (or `maxPages` is hit), guarding against repeated
 * cursors. Iterate items with an inner loop over each page.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetContractsForOwnerParams} params Same params as getContractsForOwner (the cursor is managed for you)
 * @param {PaginateOptions} [options] Abort signal and page cap
 * @returns {AsyncGenerator<GetContractsForOwnerResult, void, undefined>} Pages, in order
 */
export function getContractsForOwnerPages(
  client: DataClient,
  params: GetContractsForOwnerParams,
  options?: PaginateOptions,
): AsyncGenerator<GetContractsForOwnerResult, void, undefined> {
  return paginate({
    fetchPage: (cursor, signal) =>
      getContractsForOwner(client, { ...params, pageKey: cursor }, { signal }),
    nextCursor: (page) => page.pageKey,
    options,
  });
}
