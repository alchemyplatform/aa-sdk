import { alchemyTransport } from "@alchemy/common";
import { createClient } from "viem";
import { mainnet } from "viem/chains";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dataActions } from "./dataActions.js";

const fetchMock = vi.fn();

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("parked viem adapter", () => {
  it("extends a viem client with an Alchemy transport, reusing its auth and chain", async () => {
    fetchMock.mockImplementation(async () =>
      jsonResponse({ ownedNfts: [], totalCount: 0 }),
    );

    const client = createClient({
      chain: mainnet,
      transport: alchemyTransport({ apiKey: "test-key" }),
    }).extend(dataActions);

    await client.nft.getNftsForOwner({ owner: "0xabc" });
    expect(String(fetchMock.mock.calls[0]![0])).toBe(
      "https://eth-mainnet.g.alchemy.com/nft/v3/getNFTsForOwner?owner=0xabc",
    );
    const headers = fetchMock.mock.calls[0]![1].headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer test-key");
  });

  it("routes JSON-RPC through the shared runtime (envelope, network-scoped url)", async () => {
    fetchMock.mockImplementation(async () =>
      jsonResponse({ jsonrpc: "2.0", id: 1, result: { transfers: [] } }),
    );

    const client = createClient({
      chain: mainnet,
      transport: alchemyTransport({ apiKey: "test-key" }),
    }).extend(dataActions);

    const result = await client.transfers.getAssetTransfers({
      category: ["erc20"],
    });
    expect(result).toEqual({ transfers: [] });
    expect(String(fetchMock.mock.calls[0]![0])).toContain(
      "https://eth-mainnet.g.alchemy.com/v2",
    );
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body).jsonrpc).toBe("2.0");
  });
});
