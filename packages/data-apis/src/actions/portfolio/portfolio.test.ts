import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDataClient } from "../../client.js";

const fetchMock = vi.fn();

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

const makeClient = () =>
  createDataClient({ apiKey: "test-key", network: "eth-mainnet" });

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  fetchMock.mockImplementation(async () => jsonResponse({ data: {} }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const DATA_BASE = "https://api.g.alchemy.com/data/v1";

describe("portfolio namespace", () => {
  it.each([
    ["getTokenBalancesByAddress", "assets/tokens/balances/by-address"],
    ["getNftsByAddress", "assets/nfts/by-address"],
    ["getNftContractsByAddress", "assets/nfts/contracts/by-address"],
  ] as const)("%s posts to the global Data API", async (method, route) => {
    const data = makeClient();
    await data.portfolio[method]({
      addresses: [{ address: "0xa", networks: ["eth-mainnet", "eip155:8453"] }],
    });
    expect(String(fetchMock.mock.calls[0]![0])).toBe(`${DATA_BASE}/${route}`);
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body)).toEqual({
      addresses: [
        { address: "0xa", networks: ["eth-mainnet", "base-mainnet"] },
      ],
    });
  });

  it("preserves per-entry fields beyond address/networks", async () => {
    await makeClient().portfolio.getNftsByAddress({
      addresses: [
        {
          address: "0xa",
          networks: ["eth-mainnet"],
          excludeFilters: ["SPAM"],
        },
      ],
      pageSize: 10,
    });
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body)).toEqual({
      addresses: [
        { address: "0xa", networks: ["eth-mainnet"], excludeFilters: ["SPAM"] },
      ],
      pageSize: 10,
    });
  });
});
