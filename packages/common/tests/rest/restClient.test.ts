import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AlchemyRestClient } from "../../src/rest/restClient.js";
import { AlchemyApiError } from "../../src/errors/AlchemyApiError.js";
import { AlchemyServerError } from "../../src/errors/AlchemyServerError.js";
import { AlchemyFetchError } from "../../src/errors/AlchemyFetchError.js";

type TestSchema = readonly [
  {
    Route: "things";
    Method: "GET";
    Body?: undefined;
    Query?: { owner?: string; "tags[]"?: string[]; limit?: number } | undefined;
    Response: { ok: boolean };
  },
  {
    Route: "things/create";
    Method: "POST";
    Body: { name: string };
    Response: { id: string };
  },
];

const fetchMock = vi.fn();

const jsonResponse = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });

const makeClient = (
  overrides?: ConstructorParameters<typeof AlchemyRestClient>[0],
) =>
  new AlchemyRestClient<TestSchema>({
    apiKey: "test-key",
    url: "https://example.test/api",
    retryDelay: 1, // keep retry tests fast
    ...overrides,
  });

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AlchemyRestClient query serialization", () => {
  it("serializes scalars, repeats array keys, and skips nullish values", async () => {
    fetchMock.mockImplementation(async () => jsonResponse({ ok: true }));
    const client = makeClient();
    await client.request({
      route: "things",
      method: "GET",
      query: { owner: "0xabc", "tags[]": ["a", "b"], limit: undefined },
    });
    const url = String(fetchMock.mock.calls[0]![0]);
    expect(url).toBe(
      "https://example.test/api/things?owner=0xabc&tags%5B%5D=a&tags%5B%5D=b",
    );
  });

  it("sends no query string when the query object is empty", async () => {
    fetchMock.mockImplementation(async () => jsonResponse({ ok: true }));
    await makeClient().request({ route: "things", method: "GET", query: {} });
    expect(String(fetchMock.mock.calls[0]![0])).toBe(
      "https://example.test/api/things",
    );
  });
});

describe("AlchemyRestClient request id", () => {
  it("sends X-Alchemy-Client-Request-Id and keeps it stable across retries", async () => {
    fetchMock
      .mockImplementationOnce(async () => jsonResponse({}, { status: 500 }))
      .mockImplementationOnce(async () => jsonResponse({ ok: true }));
    await makeClient().request({ route: "things", method: "GET" });

    const ids = fetchMock.mock.calls.map((call) =>
      (call[1].headers as Headers).get("X-Alchemy-Client-Request-Id"),
    );
    expect(ids[0]).toMatch(/^[0-9a-f-]{36}$/);
    expect(ids[1]).toBe(ids[0]);
  });

  it("surfaces the request id on thrown AlchemyServerError", async () => {
    fetchMock.mockImplementation(async () => jsonResponse({}, { status: 400 }));
    const error = await makeClient()
      .request({ route: "things", method: "GET" })
      .catch((e) => e);
    expect(error).toBeInstanceOf(AlchemyServerError);
    expect(error).toBeInstanceOf(AlchemyApiError);
    expect(error.requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(error.status).toBe(400);
  });
});

describe("AlchemyRestClient retries", () => {
  it("retries 429 and 5xx up to retryCount, then succeeds", async () => {
    fetchMock
      .mockImplementationOnce(async () => jsonResponse({}, { status: 429 }))
      .mockImplementationOnce(async () => jsonResponse({}, { status: 503 }))
      .mockImplementationOnce(async () => jsonResponse({ ok: true }));
    const result = await makeClient().request({
      route: "things",
      method: "GET",
    });
    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("does not retry non-429 4xx", async () => {
    fetchMock.mockImplementation(async () =>
      jsonResponse({ error: { code: "bad-owner" } }, { status: 400 }),
    );
    const error = await makeClient()
      .request({ route: "things", method: "GET" })
      .catch((e) => e);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(error.code).toBe("bad-owner");
  });

  it("honors Retry-After seconds and exposes retryAfter on the final error", async () => {
    fetchMock.mockImplementation(
      async () =>
        new Response("{}", {
          status: 429,
          headers: { "Retry-After": "0" },
        }),
    );
    const error = await makeClient({ retryCount: 1, retryDelay: 1 })
      .request({ route: "things", method: "GET" })
      .catch((e) => e);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(error.status).toBe(429);
    expect(error.retryAfter).toBe(0);
  });

  it("retries network errors and throws AlchemyFetchError with requestId when exhausted", async () => {
    fetchMock.mockImplementation(async () => {
      throw new TypeError("fetch failed");
    });
    const error = await makeClient({ retryCount: 2 })
      .request({ route: "things", method: "GET" })
      .catch((e) => e);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(error).toBeInstanceOf(AlchemyFetchError);
    expect(error.requestId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("respects per-request retryCount override of 0", async () => {
    fetchMock.mockImplementation(async () => jsonResponse({}, { status: 500 }));
    await makeClient()
      .request({ route: "things", method: "GET", retryCount: 0 })
      .catch(() => {});
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("AlchemyRestClient abort", () => {
  it("propagates a caller abort immediately without retrying", async () => {
    const controller = new AbortController();
    fetchMock.mockImplementation(async (_url, init: RequestInit) => {
      controller.abort(new Error("user-cancelled"));
      throw (init.signal as AbortSignal).reason;
    });
    const error = await makeClient()
      .request({ route: "things", method: "GET", signal: controller.signal })
      .catch((e) => e);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(error.message).toBe("user-cancelled");
  });
});

describe("AlchemyRestClient bodies", () => {
  it("posts JSON bodies as before", async () => {
    fetchMock.mockImplementation(async () => jsonResponse({ id: "1" }));
    const result = await makeClient().request({
      route: "things/create",
      method: "POST",
      body: { name: "x" },
    });
    expect(result).toEqual({ id: "1" });
    expect(fetchMock.mock.calls[0]![1].body).toBe(
      JSON.stringify({ name: "x" }),
    );
  });
});
