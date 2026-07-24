import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDataClient } from "./client.js";

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

describe("createDataClient", () => {
  it("routes multi-network portfolio calls to the global Data API with resolved slugs", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { tokens: [] } }));

    const data = createDataClient({
      apiKey: "test-key",
      network: "eth-mainnet",
    });

    await data.portfolio.getTokensByAddress({
      addresses: [
        // all three network input formats in one request
        {
          address: "0xabc",
          networks: ["eth-mainnet", "base-mainnet", "eip155:10"],
        },
        { address: "0xdef", networks: ["solana-mainnet"] },
      ],
    });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(
      "https://api.g.alchemy.com/data/v1/assets/tokens/by-address",
    );
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({
      addresses: [
        {
          address: "0xabc",
          networks: ["eth-mainnet", "base-mainnet", "opt-mainnet"],
        },
        { address: "0xdef", networks: ["solana-mainnet"] },
      ],
    });
  });

  it("routes NFT calls to the network-scoped URL, honoring per-request override", async () => {
    fetchMock.mockImplementation(async () =>
      jsonResponse({ ownedNfts: [], totalCount: 0 }),
    );

    const data = createDataClient({
      apiKey: "test-key",
      network: "eth-mainnet",
    });

    await data.nft.getNftsForOwner({ owner: "0xabc" });
    expect(String(fetchMock.mock.calls[0]![0])).toBe(
      "https://eth-mainnet.g.alchemy.com/nft/v3/getNFTsForOwner?owner=0xabc",
    );

    await data.nft.getNftsForOwner({ owner: "0xabc", network: "eip155:8453" });
    expect(String(fetchMock.mock.calls[1]![0])).toBe(
      "https://base-mainnet.g.alchemy.com/nft/v3/getNFTsForOwner?owner=0xabc",
    );
  });

  it("routes transfers over JSON-RPC, deriving a transport for network overrides", async () => {
    fetchMock.mockImplementation(async () =>
      jsonResponse({ jsonrpc: "2.0", id: 1, result: { transfers: [] } }),
    );

    const data = createDataClient({
      apiKey: "test-key",
      network: "eth-mainnet",
    });

    const result = await data.transfers.getAssetTransfers({
      category: ["erc20"],
    });
    expect(result).toEqual({ transfers: [] });
    expect(String(fetchMock.mock.calls[0]![0])).toContain(
      "https://eth-mainnet.g.alchemy.com/v2",
    );
    const rpcBody = JSON.parse(fetchMock.mock.calls[0]![1].body);
    expect(rpcBody.method).toBe("alchemy_getAssetTransfers");
    expect(rpcBody.params).toEqual([{ category: ["erc20"] }]);

    await data.transfers.getAssetTransfers({
      category: ["erc20"],
      network: "arb-mainnet",
    });
    expect(String(fetchMock.mock.calls[1]![0])).toContain(
      "https://arb-mainnet.g.alchemy.com/v2",
    );
  });

  it("sends a well-formed JSON-RPC envelope with a request id header", async () => {
    fetchMock.mockImplementation(async () =>
      jsonResponse({ jsonrpc: "2.0", id: 1, result: { transfers: [] } }),
    );
    const data = createDataClient({
      apiKey: "test-key",
      network: "eth-mainnet",
    });
    await data.transfers.getAssetTransfers({ category: ["erc20"] });

    const rpcBody = JSON.parse(fetchMock.mock.calls[0]![1].body);
    expect(rpcBody.jsonrpc).toBe("2.0");
    expect(typeof rpcBody.id).toBe("number");
    const headers = fetchMock.mock.calls[0]![1].headers as Headers;
    expect(headers.get("X-Alchemy-Client-Request-Id")).toMatch(
      /^[0-9a-f-]{36}$/,
    );
  });

  it("constructs without a network: portfolio works, single-network methods error clearly", async () => {
    fetchMock.mockImplementation(async () =>
      jsonResponse({ data: { tokens: [] } }),
    );
    const data = createDataClient({ apiKey: "test-key" });

    await data.portfolio.getTokensByAddress({
      addresses: [{ address: "0xabc", networks: ["eth-mainnet"] }],
    });
    expect(String(fetchMock.mock.calls[0]![0])).toBe(
      "https://api.g.alchemy.com/data/v1/assets/tokens/by-address",
    );

    await expect(data.nft.getNftsForOwner({ owner: "0xabc" })).rejects.toThrow(
      /No network available/,
    );

    fetchMock.mockImplementation(async () =>
      jsonResponse({ ownedNfts: [], totalCount: 0 }),
    );
    const result = await data.nft.getNftsForOwner({
      owner: "0xabc",
      network: "eth-mainnet",
    });
    expect(result.totalCount).toBe(0);
  });
});
