import { paginate, type PaginateOptions } from "../../internal/paginate.js";
import type { DataClient } from "../../internal/clientHelpers.js";
import { getNftsByAddress } from "./getNftsByAddress.js";
import type {
  GetNftsByAddressParams,
  GetNftsByAddressResult,
} from "../../types.js";

/**
 * Auto-paginating companion to {@link getNftsByAddress}: yields whole pages until the
 * cursor is exhausted (or `maxPages` is hit), guarding against repeated
 * cursors. Iterate items with an inner loop over each page.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetNftsByAddressParams} params Same params as getNftsByAddress (the cursor is managed for you)
 * @param {PaginateOptions} [options] Abort signal and page cap
 * @returns {AsyncGenerator<GetNftsByAddressResult, void, undefined>} Pages, in order
 */
export function getNftsByAddressPages(
  client: DataClient,
  params: GetNftsByAddressParams,
  options?: PaginateOptions,
): AsyncGenerator<GetNftsByAddressResult, void, undefined> {
  return paginate({
    fetchPage: (cursor, signal) =>
      getNftsByAddress(client, { ...params, pageKey: cursor }, { signal }),
    nextCursor: (page) => page.data.pageKey,
    options,
  });
}
