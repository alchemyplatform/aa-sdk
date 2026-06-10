import { AlchemyApiError } from "@alchemy/common";
import { HttpRequestError, RpcRequestError } from "viem";
import { describe, expect, it } from "vitest";
import { redactUrlCredentials, wrapRpcError } from "./errors.js";

const SECRET = "supersecretapikey123";

describe("redactUrlCredentials", () => {
  it("redacts /v2/<key> path segments and apiKey query params", () => {
    expect(
      redactUrlCredentials(
        `https://eth-mainnet.g.alchemy.com/v2/${SECRET} and https://x.test/?apiKey=${SECRET}&y=1`,
      ),
    ).toBe(
      "https://eth-mainnet.g.alchemy.com/v2/[redacted] and https://x.test/?apiKey=[redacted]&y=1",
    );
  });
});

describe("wrapRpcError", () => {
  it("maps RpcRequestError to AlchemyApiError with the rpc code, redacted", () => {
    const viemError = new RpcRequestError({
      body: { method: "alchemy_getAssetTransfers" },
      url: `https://eth-mainnet.g.alchemy.com/v2/${SECRET}`,
      error: { code: -32602, message: "invalid params" },
    });
    const wrapped = (() => {
      try {
        wrapRpcError(viemError);
      } catch (e) {
        return e as AlchemyApiError;
      }
      throw new Error("did not throw");
    })();
    expect(wrapped).toBeInstanceOf(AlchemyApiError);
    expect(wrapped.code).toBe(-32602);
    expect(wrapped.message).not.toContain(SECRET);
  });

  it("maps HttpRequestError to AlchemyApiError with the status, redacted", () => {
    const viemError = new HttpRequestError({
      url: `https://eth-mainnet.g.alchemy.com/v2/${SECRET}`,
      status: 503,
      details: `service unavailable at /v2/${SECRET}`,
    });
    const wrapped = (() => {
      try {
        wrapRpcError(viemError);
      } catch (e) {
        return e as AlchemyApiError;
      }
      throw new Error("did not throw");
    })();
    expect(wrapped).toBeInstanceOf(AlchemyApiError);
    expect(wrapped.status).toBe(503);
    expect(wrapped.message).not.toContain(SECRET);
    expect(JSON.stringify(wrapped)).not.toContain(SECRET);
  });

  it("passes AlchemyApiError and unknown errors through untouched", () => {
    const original = new AlchemyApiError("already normalized", { status: 400 });
    expect(() => wrapRpcError(original)).toThrow(original);

    const unknown = new Error("not a viem error");
    expect(() => wrapRpcError(unknown)).toThrow(unknown);
  });
});
