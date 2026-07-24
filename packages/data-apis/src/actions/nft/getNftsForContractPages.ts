import { paginate, type PaginateOptions } from "../../internal/paginate.js";
import type { DataClient } from "../../internal/clientHelpers.js";
import { getNftsForContract } from "./getNftsForContract.js";
import type {
  GetNftsForContractParams,
  GetNftsForContractResult,
} from "../../types.js";

/**
 * Auto-paginating companion to {@link getNftsForContract}: yields whole pages until the
 * cursor is exhausted (or `maxPages` is hit), guarding against repeated
 * cursors. Iterate items with an inner loop over each page.
 *
 * @param {DataClient} client A client configured with an Alchemy transport
 * @param {GetNftsForContractParams} params Same params as getNftsForContract (the cursor is managed for you)
 * @param {PaginateOptions} [options] Abort signal and page cap
 * @returns {AsyncGenerator<GetNftsForContractResult, void, undefined>} Pages, in order
 */
export function getNftsForContractPages(
  client: DataClient,
  params: GetNftsForContractParams,
  options?: PaginateOptions,
): AsyncGenerator<GetNftsForContractResult, void, undefined> {
  return paginate({
    fetchPage: (cursor, signal) =>
      getNftsForContract(client, { ...params, startToken: cursor }, { signal }),
    nextCursor: (page) => page.pageKey,
    options,
  });
}
