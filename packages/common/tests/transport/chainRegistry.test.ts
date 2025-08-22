import { describe, it, expect } from "vitest";
import {
  getAlchemyRpcUrl,
  isChainSupported,
  getSupportedChainIds,
  ALCHEMY_RPC_MAPPING,
} from "../../src/transport/chainRegistry.js";
import { sepolia, mainnet, arbitrum, avalanche } from "viem/chains";

describe("Chain Registry Tests", () => {
  describe("getAlchemyRpcUrl", () => {
    it("should return correct RPC URL for supported mainnet", () => {
      const url = getAlchemyRpcUrl(mainnet.id);
      expect(url).toBe("https://eth-mainnet.g.alchemy.com/v2");
    });

    it("should return undefined for unsupported chain", () => {
      const url = getAlchemyRpcUrl(avalanche.id);
      expect(url).toBeUndefined();
    });

    it("should return undefined for non-existent chain ID", () => {
      const url = getAlchemyRpcUrl(999999);
      expect(url).toBeUndefined();
    });
  });

  describe("isChainSupported", () => {
    it("should return true for supported chains", () => {
      expect(isChainSupported(mainnet.id)).toBe(true);
      expect(isChainSupported(sepolia.id)).toBe(true);
      expect(isChainSupported(arbitrum.id)).toBe(true);
    });

    it("should return false for unsupported chains", () => {
      expect(isChainSupported(avalanche.id)).toBe(false);
      expect(isChainSupported(999999)).toBe(false);
    });

    it("should be consistent with getAlchemyRpcUrl", () => {
      const testChainIds = [1, 11155111, 42161, 999999, 0];
      
      testChainIds.forEach(chainId => {
        const hasUrl = getAlchemyRpcUrl(chainId) !== undefined;
        const isSupported = isChainSupported(chainId);
        expect(isSupported).toBe(hasUrl);
      });
    });
  });

  describe("getSupportedChainIds", () => {
    it("should return an array of numbers", () => {
      const chainIds = getSupportedChainIds();
      expect(Array.isArray(chainIds)).toBe(true);
      expect(chainIds.every(id => typeof id === "number")).toBe(true);
    });

    it("should return all chain IDs from the mapping", () => {
      const chainIds = getSupportedChainIds();
      const mappingKeys = Object.keys(ALCHEMY_RPC_MAPPING).map(Number);
      
      expect(chainIds.sort()).toEqual(mappingKeys.sort());
    });
  });
});