import { describe, expect, it } from "vitest";
import {
  resolveNetwork,
  resolveNetworkByChainId,
} from "../../src/networks/networkRegistry.js";

describe("resolveNetwork", () => {
  it("resolves a chain id via the adapter bridge", () => {
    expect(resolveNetworkByChainId(1)).toEqual({
      slug: "eth-mainnet",
      chainId: 1,
    });
    expect(resolveNetworkByChainId(421614)).toEqual({
      slug: "arb-sepolia",
      chainId: 421614,
    });
  });

  it("resolves a known slug to the same entry as the chain id", () => {
    expect(resolveNetwork("eth-mainnet")).toEqual(resolveNetworkByChainId(1));
  });

  it("resolves CAIP-2 identifiers", () => {
    expect(resolveNetwork("eip155:1")).toEqual({
      slug: "eth-mainnet",
      chainId: 1,
    });
    expect(resolveNetwork("solana:mainnet")).toEqual({
      slug: "solana-mainnet",
    });
    expect(resolveNetwork("solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp")).toEqual({
      slug: "solana-mainnet",
    });
  });

  it("passes through unknown slugs as the escape hatch", () => {
    expect(resolveNetwork("some-new-chain")).toEqual({
      slug: "some-new-chain",
      chainId: undefined,
    });
  });

  it("rejects inputs that are not valid hostname labels", () => {
    expect(() => resolveNetwork("Not A Slug!")).toThrow();
    expect(() => resolveNetwork("eth-mainnet/../evil")).toThrow();
  });

  it("rejects chain ids and CAIP-2 ids missing from the registry", () => {
    expect(() => resolveNetworkByChainId(999999001)).toThrow();
    expect(() => resolveNetwork("eip155:999999001")).toThrow();
    expect(() => resolveNetwork("solana:unknownref")).toThrow();
  });
});
