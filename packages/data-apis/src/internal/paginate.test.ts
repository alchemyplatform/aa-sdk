import { describe, expect, it, vi } from "vitest";
import { paginate } from "./paginate.js";

type Page = { items: number[]; pageKey?: string };

const collect = async (gen: AsyncGenerator<Page>) => {
  const pages: Page[] = [];
  for await (const page of gen) pages.push(page);
  return pages;
};

describe("paginate", () => {
  it("walks cursors until the response omits one", async () => {
    const fetchPage = vi
      .fn<(cursor: string | undefined) => Promise<Page>>()
      .mockResolvedValueOnce({ items: [1], pageKey: "a" })
      .mockResolvedValueOnce({ items: [2], pageKey: "b" })
      .mockResolvedValueOnce({ items: [3] });
    const pages = await collect(
      paginate({ fetchPage, nextCursor: (p) => p.pageKey }),
    );
    expect(pages.map((p) => p.items[0])).toEqual([1, 2, 3]);
    expect(fetchPage.mock.calls.map((c) => c[0])).toEqual([
      undefined,
      "a",
      "b",
    ]);
  });

  it("stops on an empty-string cursor", async () => {
    const fetchPage = vi
      .fn<(cursor: string | undefined) => Promise<Page>>()
      .mockResolvedValue({ items: [1], pageKey: "" });
    const pages = await collect(
      paginate({ fetchPage, nextCursor: (p) => p.pageKey }),
    );
    expect(pages).toHaveLength(1);
  });

  it("throws on a repeated cursor instead of looping forever", async () => {
    const fetchPage = vi
      .fn<(cursor: string | undefined) => Promise<Page>>()
      .mockResolvedValue({ items: [1], pageKey: "same" });
    await expect(
      collect(paginate({ fetchPage, nextCursor: (p) => p.pageKey })),
    ).rejects.toThrow(/repeated/);
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it("respects maxPages, yielding the capping page", async () => {
    const fetchPage = vi
      .fn<(cursor: string | undefined) => Promise<Page>>()
      .mockImplementation(async (cursor) => ({
        items: [Number(cursor ?? 0)],
        pageKey: String(Number(cursor ?? 0) + 1),
      }));
    const pages = await collect(
      paginate({
        fetchPage,
        nextCursor: (p) => p.pageKey,
        options: { maxPages: 3 },
      }),
    );
    expect(pages).toHaveLength(3);
    expect(fetchPage).toHaveBeenCalledTimes(3);
  });

  it("stops cleanly when the consumer breaks", async () => {
    const fetchPage = vi
      .fn<(cursor: string | undefined) => Promise<Page>>()
      .mockImplementation(async (cursor) => ({
        items: [1],
        pageKey: String(Number(cursor ?? 0) + 1),
      }));
    for await (const page of paginate({
      fetchPage,
      nextCursor: (p) => p.pageKey,
    })) {
      void page;
      break;
    }
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it("throws the abort reason when the signal aborts between pages", async () => {
    const controller = new AbortController();
    const fetchPage = vi
      .fn<(cursor: string | undefined) => Promise<Page>>()
      .mockImplementation(async () => {
        controller.abort(new Error("stop-now"));
        return { items: [1], pageKey: "next" };
      });
    await expect(
      collect(
        paginate({
          fetchPage,
          nextCursor: (p) => p.pageKey,
          options: { signal: controller.signal },
        }),
      ),
    ).rejects.toThrow("stop-now");
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });
});
