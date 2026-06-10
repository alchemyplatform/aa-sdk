import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mainnet } from "viem/chains";
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
  fetchMock.mockImplementation(async () => jsonResponse({ data: [] }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const PRICES_BASE = "https://api.g.alchemy.com/prices/v1";

describe("prices namespace", () => {
  it("by-symbol is a chain-agnostic GET with repeated symbols", async () => {
    await makeClient().prices.getTokenPricesBySymbol({
      symbols: ["ETH", "USDC"],
    });
    const url = new URL(String(fetchMock.mock.calls[0]![0]));
    expect(`${url.origin}${url.pathname}`).toBe(
      `${PRICES_BASE}/tokens/by-symbol`,
    );
    expect(url.searchParams.getAll("symbols")).toEqual(["ETH", "USDC"]);
    expect(fetchMock.mock.calls[0]![1].method).toBe("GET");
  });

  it("by-address resolves each entry's network to a slug in the body", async () => {
    await makeClient().prices.getTokenPricesByAddress({
      addresses: [
        { address: "0xa", network: mainnet },
        { address: "0xb", network: "eip155:8453" },
        { address: "0xc", network: "polygon-mainnet" },
      ],
    });
    expect(String(fetchMock.mock.calls[0]![0])).toBe(
      `${PRICES_BASE}/tokens/by-address`,
    );
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body)).toEqual({
      addresses: [
        { address: "0xa", network: "eth-mainnet" },
        { address: "0xb", network: "base-mainnet" },
        { address: "0xc", network: "polygon-mainnet" },
      ],
    });
  });

  it("historical accepts symbol form untouched and resolves network form", async () => {
    const data = makeClient();
    await data.prices.getHistoricalTokenPrices({
      symbol: "ETH",
      startTime: "2024-01-01T00:00:00Z",
      endTime: "2024-01-02T00:00:00Z",
      interval: "1h",
    });
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body).symbol).toBe("ETH");

    await data.prices.getHistoricalTokenPrices({
      network: "eip155:1",
      address: "0xa",
      startTime: "2024-01-01T00:00:00Z",
      endTime: "2024-01-02T00:00:00Z",
      interval: "1d",
    });
    const body = JSON.parse(fetchMock.mock.calls[1]![1].body);
    expect(body.network).toBe("eth-mainnet");
    expect(String(fetchMock.mock.calls[1]![0])).toBe(
      `${PRICES_BASE}/tokens/historical`,
    );
  });
});
