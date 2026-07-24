import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AlchemyJsonRpcClient } from "../../src/rest/jsonRpcClient.js";
import { AlchemyApiError } from "../../src/errors/AlchemyApiError.js";
import { AlchemyServerError } from "../../src/errors/AlchemyServerError.js";

type TestSchema = readonly [
  {
    Method: "alchemy_getThings";
    Parameters: [{ owner: string }];
    ReturnType: { things: string[] };
  },
];

const fetchMock = vi.fn();

const rpcResponse = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });

const makeClient = () =>
  new AlchemyJsonRpcClient<TestSchema>({
    apiKey: "test-key",
    url: "https://eth-mainnet.example.test/v2",
    retryDelay: 1,
  });

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AlchemyJsonRpcClient", () => {
  it("posts the JSON-RPC envelope with monotonic ids and auth headers", async () => {
    fetchMock.mockImplementation(async () =>
      rpcResponse({ jsonrpc: "2.0", id: 1, result: { things: [] } }),
    );
    const client = makeClient();
    await client.request({
      method: "alchemy_getThings",
      params: [{ owner: "0xa" }],
    });
    await client.request({
      method: "alchemy_getThings",
      params: [{ owner: "0xb" }],
    });

    const body1 = JSON.parse(fetchMock.mock.calls[0]![1].body);
    const body2 = JSON.parse(fetchMock.mock.calls[1]![1].body);
    expect(body1).toEqual({
      jsonrpc: "2.0",
      id: 1,
      method: "alchemy_getThings",
      params: [{ owner: "0xa" }],
    });
    expect(body2.id).toBe(2);

    const headers = fetchMock.mock.calls[0]![1].headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer test-key");
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("X-Alchemy-Client-Request-Id")).toMatch(
      /^[0-9a-f-]{36}$/,
    );
  });

  it("retries 429 honoring Retry-After, then succeeds", async () => {
    fetchMock
      .mockImplementationOnce(
        async () =>
          new Response("{}", { status: 429, headers: { "Retry-After": "0" } }),
      )
      .mockImplementationOnce(async () =>
        rpcResponse({ jsonrpc: "2.0", id: 1, result: { things: ["x"] } }),
      );
    const result = await makeClient().request({
      method: "alchemy_getThings",
      params: [{ owner: "0xa" }],
    });
    expect(result).toEqual({ things: ["x"] });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does NOT retry JSON-RPC-level errors and maps them to AlchemyApiError", async () => {
    fetchMock.mockImplementation(async () =>
      rpcResponse({
        jsonrpc: "2.0",
        id: 1,
        error: { code: -32602, message: "invalid params" },
      }),
    );
    const error = await makeClient()
      .request({ method: "alchemy_getThings", params: [{ owner: "0xa" }] })
      .catch((e) => e);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(error).toBeInstanceOf(AlchemyApiError);
    expect(error.code).toBe(-32602);
    expect(error.requestId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("redacts credentials echoed in rpc error messages", async () => {
    fetchMock.mockImplementation(async () =>
      rpcResponse({
        jsonrpc: "2.0",
        id: 1,
        error: { code: -32000, message: "bad key at /v2/supersecret123" },
      }),
    );
    const error = await makeClient()
      .request({ method: "alchemy_getThings", params: [{ owner: "0xa" }] })
      .catch((e) => e);
    expect(error.message).not.toContain("supersecret123");
    expect(error.message).toContain("/v2/[redacted]");
  });

  it("maps non-ok HTTP responses to AlchemyServerError with status and requestId", async () => {
    fetchMock.mockImplementation(async () =>
      rpcResponse({ message: "nope" }, { status: 403 }),
    );
    const error = await makeClient()
      .request({ method: "alchemy_getThings", params: [{ owner: "0xa" }] })
      .catch((e) => e);
    expect(error).toBeInstanceOf(AlchemyServerError);
    expect(error.status).toBe(403);
    expect(error.requestId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("throws on malformed responses missing result and error", async () => {
    fetchMock.mockImplementation(async () =>
      rpcResponse({ jsonrpc: "2.0", id: 1 }),
    );
    await expect(
      makeClient().request({
        method: "alchemy_getThings",
        params: [{ owner: "0xa" }],
      }),
    ).rejects.toThrow(/Malformed JSON-RPC response/);
  });

  it("propagates caller aborts immediately", async () => {
    const controller = new AbortController();
    fetchMock.mockImplementation(async (_url, init: RequestInit) => {
      controller.abort(new Error("user-cancelled"));
      throw (init.signal as AbortSignal).reason;
    });
    const error = await makeClient()
      .request(
        { method: "alchemy_getThings", params: [{ owner: "0xa" }] },
        { signal: controller.signal },
      )
      .catch((e) => e);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(error.message).toBe("user-cancelled");
  });
});
