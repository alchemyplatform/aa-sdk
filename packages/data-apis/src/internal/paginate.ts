import { AlchemyError } from "@alchemy/common";

/** Options accepted by the `*Pages` async-iterator actions. */
export type PaginateOptions = {
  /** Aborts iteration (checked between pages and passed to page requests). */
  signal?: AbortSignal;
  /** Stop after this many pages (the page that hits the cap is still yielded). */
  maxPages?: number;
};

/**
 * Shared cursor-pagination driver behind the `*Pages` actions. Yields whole
 * pages (page-level metadata like totalCount/validAt stays available;
 * per-item iteration is one inner loop away). Stops on a missing or empty
 * cursor, and throws if the server ever repeats a cursor — the guard against
 * infinite pagination loops.
 *
 * @param {object} config The pagination wiring
 * @param {Function} config.fetchPage Fetches one page for a cursor (undefined = first page)
 * @param {Function} config.nextCursor Extracts the next cursor from a page
 * @param {PaginateOptions} [config.options] Abort signal and page cap
 * @returns {AsyncGenerator} Pages, in order
 * @yields Each page result as returned by fetchPage
 */
export async function* paginate<TPage>({
  fetchPage,
  nextCursor,
  options,
}: {
  fetchPage: (
    cursor: string | undefined,
    signal?: AbortSignal,
  ) => Promise<TPage>;
  nextCursor: (page: TPage) => string | null | undefined;
  options?: PaginateOptions;
}): AsyncGenerator<TPage, void, undefined> {
  const seen = new Set<string>();
  let cursor: string | undefined;
  let pages = 0;
  while (true) {
    options?.signal?.throwIfAborted();
    const page = await fetchPage(cursor, options?.signal);
    yield page;
    if (options?.maxPages != null && ++pages >= options.maxPages) return;
    const next = nextCursor(page);
    if (next == null || next === "") return;
    if (seen.has(next)) {
      throw new AlchemyError(
        `Pagination cursor "${next}" was repeated by the server; stopping to avoid an infinite loop.`,
      );
    }
    seen.add(next);
    cursor = next;
  }
}
