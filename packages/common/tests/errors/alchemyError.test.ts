import { describe, expect, it } from "vitest";
import { AlchemyError } from "../../src/errors/AlchemyError.js";
import { AlchemyApiError } from "../../src/errors/AlchemyApiError.js";
import { ServerError } from "../../src/errors/ServerError.js";
import { FetchError } from "../../src/errors/FetchError.js";
import { BaseError } from "../../src/errors/BaseError.js";
import { VERSION } from "../../src/version.js";

describe("AlchemyError", () => {
  it("formats messages like BaseError (short message, meta, details, version)", () => {
    const error = new AlchemyError("Something failed", {
      metaMessages: ["Request ID: abc"],
      details: "boom",
    });
    expect(error.message).toBe(
      [
        "Something failed",
        "",
        "Request ID: abc",
        "",
        "Details: boom",
        `Version: ${VERSION}`,
      ].join("\n"),
    );
    expect(error.shortMessage).toBe("Something failed");
  });

  it("derives details and docs path from an AlchemyError cause", () => {
    const cause = new AlchemyError("inner", {
      details: "inner-details",
      docsPath: "/path",
    });
    const outer = new AlchemyError("outer", { cause });
    expect(outer.details).toBe("inner-details");
    expect(outer.docsPath).toBe("/path");
    expect(outer.message).toContain("Docs: https://www.alchemy.com");
  });

  it("walk() returns the deepest cause without a predicate and first match with one", () => {
    const root = new Error("root");
    const mid = new AlchemyError("mid", { cause: root });
    const top = new AlchemyError("top", { cause: mid });
    expect(top.walk()).toBe(root);
    expect(
      top.walk((e) => e instanceof AlchemyError && e.shortMessage === "mid"),
    ).toBe(mid);
    expect(top.walk(() => false)).toBeNull();
  });

  it("the API error family is viem-free: not instanceof BaseError", () => {
    const server = new ServerError("body", 500);
    const fetchErr = new FetchError("route", "GET");
    for (const error of [server, fetchErr]) {
      expect(error).toBeInstanceOf(AlchemyApiError);
      expect(error).toBeInstanceOf(AlchemyError);
      expect(error).toBeInstanceOf(Error);
      // deliberately NOT instanceof the viem-extending BaseError
      expect(error).not.toBeInstanceOf(BaseError);
    }
  });

  it("wallet-facing BaseError is untouched (still its own hierarchy)", () => {
    const base = new BaseError("wallet error");
    expect(base).toBeInstanceOf(Error);
    expect(base).not.toBeInstanceOf(AlchemyError);
  });
});
