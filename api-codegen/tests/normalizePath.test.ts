import { describe, expect, it } from "vitest";
import { normalizePath } from "../src/rest/normalizePath.js";
import { CodegenError } from "../src/errors.js";

describe("normalizePath", () => {
  it("strips {apiKey} segments and leading slash", () => {
    expect(
      normalizePath("/{apiKey}/assets/tokens/by-address", {
        stripApiKeySegment: true,
      }),
    ).toBe("assets/tokens/by-address");
  });

  it("strips a configured prefix after the apiKey segment", () => {
    expect(
      normalizePath("/v3/{apiKey}/getNFTsForOwner", {
        stripApiKeySegment: true,
        stripPrefix: "/v3",
      }),
    ).toBe("getNFTsForOwner");
  });

  it("strips {apiKey} by default", () => {
    expect(normalizePath("/{apiKey}/foo")).toBe("foo");
  });

  it("preserves other path params", () => {
    expect(normalizePath("/{apiKey}/contracts/{address}")).toBe(
      "contracts/{address}",
    );
  });

  it("errors when the configured prefix does not match", () => {
    expect(() =>
      normalizePath("/v4/{apiKey}/getNFTsForOwner", { stripPrefix: "/v3" }),
    ).toThrow(CodegenError);
  });

  it("errors when normalization produces an empty route", () => {
    expect(() => normalizePath("/{apiKey}")).toThrow(CodegenError);
  });
});
