import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDataClient } from "../../client.js";

const fetchMock = vi.fn();

const rpcResponse = (result: unknown) =>
  new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

const makeClient = () =>
  createDataClient({ apiKey: "test-key", network: "eth-mainnet" });

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  fetchMock.mockImplementation(async () => rpcResponse({}));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const rpcBody = (call: number) =>
  JSON.parse(fetchMock.mock.calls[call]![1].body);

describe("token namespace", () => {
  it("getTokenBalances sends positional params, omitting unset trailing optionals", async () => {
    const data = makeClient();
    await data.token.getTokenBalances({ address: "0xa" });
    expect(rpcBody(0).method).toBe("alchemy_getTokenBalances");
    expect(rpcBody(0).params).toEqual(["0xa"]);

    await data.token.getTokenBalances({ address: "0xa", tokenSpec: "erc20" });
    expect(rpcBody(1).params).toEqual(["0xa", "erc20"]);

    await data.token.getTokenBalances({
      address: "0xa",
      options: { pageKey: "next", maxCount: 10 },
    });
    // tokenSpec defaults to "erc20" when paging options are supplied alone
    expect(rpcBody(2).params).toEqual([
      "0xa",
      "erc20",
      { pageKey: "next", maxCount: 10 },
    ]);
  });

  it("getTokenMetadata and getTokenAllowance send spec-shaped params", async () => {
    const data = makeClient();
    await data.token.getTokenMetadata({ contractAddress: "0xc" });
    expect(rpcBody(0).method).toBe("alchemy_getTokenMetadata");
    expect(rpcBody(0).params).toEqual(["0xc"]);

    await data.token.getTokenAllowance({
      contract: "0xc",
      owner: "0xo",
      spender: "0xs",
    });
    expect(rpcBody(1).method).toBe("alchemy_getTokenAllowance");
    expect(rpcBody(1).params).toEqual([
      { contract: "0xc", owner: "0xo", spender: "0xs" },
    ]);
  });

  it("honors per-request network overrides", async () => {
    await makeClient().token.getTokenMetadata({
      contractAddress: "0xc",
      network: "arb-mainnet",
    });
    expect(String(fetchMock.mock.calls[0]![0])).toContain(
      "https://arb-mainnet.g.alchemy.com/v2",
    );
  });
});
