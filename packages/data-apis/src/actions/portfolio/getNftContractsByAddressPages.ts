import { paginate, type PaginateOptions } from "../../internal/paginate.js";
import type { DataClient } from "../../internal/clientHelpers.js";
import { getNftContractsByAddress } from "./getNftContractsByAddress.js";
import type {
  GetNftContractsByAddressParams,
  GetNftContractsByAddressResult,
} from "../../types.js";

/**
 * Auto-paginating companion to {@link getNftContractsByAddress}: yields whole pages until the
 * cursor is exhausted (or `maxPages` is hit), guarding against repeated
 * cursors. Iterate items with an inner loop over each page.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetNftContractsByAddressParams} params Same params as getNftContractsByAddress (the cursor is managed for you)
 * @param {PaginateOptions} [options] Abort signal and page cap
 * @returns {AsyncGenerator<GetNftContractsByAddressResult, void, undefined>} Pages, in order
 */
export function getNftContractsByAddressPages(
  client: DataClient,
  params: GetNftContractsByAddressParams,
  options?: PaginateOptions,
): AsyncGenerator<GetNftContractsByAddressResult, void, undefined> {
  return paginate({
    fetchPage: (cursor, signal) =>
      getNftContractsByAddress(
        client,
        { ...params, pageKey: cursor },
        { signal },
      ),
    nextCursor: (page) => page.data.pageKey,
    options,
  });
}
