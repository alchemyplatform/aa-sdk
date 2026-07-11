import { describe, it, expect } from "vitest";
import { sepolia, mainnet, arbitrum, fantom } from "viem/chains";
import { alchemyTransport } from "../../src/transport/alchemy.js";
import { getAlchemyRpcUrl } from "../../src/transport/chainRegistry.js";
import { defineChain } from "viem";

describe("Registry Integration Tests", () => {
  describe("Transport Registry Integration", () => {
    it("should use registry for viem chains", () => {
      const transport = alchemyTransport({ apiKey: "test-key" });

      // Test sepolia
      const sepoliaTransport = transport({ chain: sepolia });
      const expectedSepoliaUrl = getAlchemyRpcUrl(sepolia.id);
      expect(sepoliaTransport.value?.alchemyRpcUrl).toBe(expectedSepoliaUrl);

      // Test mainnet
      const mainnetTransport = transport({ chain: mainnet });
      const expectedMainnetUrl = getAlchemyRpcUrl(mainnet.id);
      expect(mainnetTransport.value?.alchemyRpcUrl).toBe(expectedMainnetUrl);

      // Test arbitrum
      const arbitrumTransport = transport({ chain: arbitrum });
      const expectedArbitrumUrl = getAlchemyRpcUrl(arbitrum.id);
      expect(arbitrumTransport.value?.alchemyRpcUrl).toBe(expectedArbitrumUrl);
    });

    it("should reject unsupported chains with helpful error", () => {
      const transport = alchemyTransport({ apiKey: "test-key" });

      expect(() => transport({ chain: fantom })).toThrowError(
        `Chain ${fantom.id} (${fantom.name}) is not supported by Alchemy`,
      );
    });

    it("should work with custom chains that have registry entries", () => {
      const transport = alchemyTransport({ apiKey: "test-key" });

      // Define a custom chain with an ID that exists in registry
      const customWorldChain = defineChain({
        id: 480, // World Chain ID that exists in registry
        name: "Custom World Chain",
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: {
          default: {
            http: ["https://custom.rpc.com"],
          },
        },
      });

      const customTransport = transport({ chain: customWorldChain });
      const expectedUrl = getAlchemyRpcUrl(480);
      expect(customTransport.value?.alchemyRpcUrl).toBe(expectedUrl);
    });

    it("should fallback to legacy alchemy RPC URLs", () => {
      const transport = alchemyTransport({ apiKey: "test-key" });

      // Define a custom chain with legacy alchemy URLs but no registry entry
      const legacyChain = defineChain({
        id: 999999, // Not in registry
        name: "Legacy Chain",
        nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
        rpcUrls: {
          default: {
            http: ["https://default.rpc.com"],
          },
          alchemy: {
            http: ["https://legacy-alchemy.g.alchemy.com/v2"],
          },
        },
      });

      const legacyTransport = transport({ chain: legacyChain });
      expect(legacyTransport.value?.alchemyRpcUrl).toBe(
        "https://legacy-alchemy.g.alchemy.com/v2",
      );
    });

    it("should fallback to Alchemy URLs in default chain RPC URLs", () => {
      const transport = alchemyTransport({ apiKey: "test-key" });

      const defaultAlchemyChain = defineChain({
        id: 999998, // Not in registry
        name: "Default Alchemy Chain",
        nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
        rpcUrls: {
          default: {
            http: ["https://default-alchemy-chain.g.alchemy.com/v2"],
          },
        },
      });

      const defaultAlchemyTransport = transport({
        chain: defaultAlchemyChain,
      });
      expect(defaultAlchemyTransport.value?.alchemyRpcUrl).toBe(
        "https://default-alchemy-chain.g.alchemy.com/v2",
      );
    });

    it("should reject Alchemy domain URLs that are not RPC endpoints", () => {
      const transport = alchemyTransport({ apiKey: "test-key" });

      const explorerChain = defineChain({
        id: 999997, // Not in registry
        name: "Explorer Chain",
        nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
        rpcUrls: {
          default: {
            http: ["https://explorer.alchemy.com"],
          },
        },
      });

      expect(() => transport({ chain: explorerChain })).toThrowError(
        `Chain ${explorerChain.id} (${explorerChain.name}) is not supported by Alchemy`,
      );
    });

    it("should reject root alchemy.com URLs in chain RPC URLs", () => {
      const transport = alchemyTransport({ apiKey: "test-key" });

      const rootAlchemyChain = defineChain({
        id: 999996, // Not in registry
        name: "Root Alchemy Chain",
        nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
        rpcUrls: {
          default: {
            http: ["https://alchemy.com/v2"],
          },
        },
      });

      expect(() => transport({ chain: rootAlchemyChain })).toThrowError(
        `Chain ${rootAlchemyChain.id} (${rootAlchemyChain.name}) is not supported by Alchemy`,
      );
    });

    it("should reject legacy alchemy RPC URLs without the v2 path", () => {
      const transport = alchemyTransport({ apiKey: "test-key" });

      const invalidLegacyAlchemyChain = defineChain({
        id: 999995, // Not in registry
        name: "Invalid Legacy Alchemy Chain",
        nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
        rpcUrls: {
          default: {
            http: ["https://default.rpc.com"],
          },
          alchemy: {
            http: ["https://invalid-legacy.g.alchemy.com"],
          },
        },
      });

      expect(() =>
        transport({ chain: invalidLegacyAlchemyChain }),
      ).toThrowError(
        `Chain ${invalidLegacyAlchemyChain.id} (${invalidLegacyAlchemyChain.name}) is not supported by Alchemy`,
      );
    });

    it("should prioritize explicit URL over registry", () => {
      const explicitUrl = "https://explicit.alchemy.com/v2/custom-key";
      const transport = alchemyTransport({
        apiKey: "test-key",
        url: explicitUrl,
      });

      const sepoliaTransport = transport({ chain: sepolia });
      expect(sepoliaTransport.value?.alchemyRpcUrl).toBe(explicitUrl);
    });

    it("should work with all registry-supported chains", () => {
      const transport = alchemyTransport({ apiKey: "test-key" });

      // Test a sampling of chains from different networks
      const testChains = [
        { id: 1, name: "mainnet" },
        { id: 11155111, name: "sepolia" },
        { id: 42161, name: "arbitrum" },
        { id: 8453, name: "base" },
        { id: 10, name: "optimism" },
        { id: 137, name: "polygon" },
      ];

      testChains.forEach(({ id, name }) => {
        const testChain = defineChain({
          id,
          name,
          nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
          rpcUrls: {
            default: { http: ["https://default.rpc.com"] },
          },
        });

        const chainTransport = transport({ chain: testChain });
        const expectedUrl = getAlchemyRpcUrl(id);

        expect(chainTransport.value?.alchemyRpcUrl).toBe(expectedUrl);
        expect(expectedUrl).toContain("alchemy.com/v2");
      });
    });
  });

  describe("End-to-End Workflow", () => {
    it("should demonstrate complete V5 workflow", () => {
      // This test demonstrates the intended V5 usage pattern

      // 1. Standard chains from viem work automatically
      const transport = alchemyTransport({ apiKey: "demo-key" });

      // 2. Registry lookup happens automatically
      const sepoliaTransport = transport({ chain: sepolia });
      expect(sepoliaTransport.value?.alchemyRpcUrl).toBe(
        "https://eth-sepolia.g.alchemy.com/v2",
      );

      // 3. Transport has correct configuration
      expect(sepoliaTransport.config.type).toBe("alchemyHttp");
      expect(sepoliaTransport.config.key).toBe("alchemyHttp");

      // 4. Headers are correctly set
      const headers = sepoliaTransport.value?.fetchOptions?.headers as Record<
        string,
        string
      >;
      expect(headers["Authorization"]).toBe("Bearer demo-key");
      expect(headers["Alchemy-AA-Sdk-Version"]).toBeDefined();
    });

    it("should work seamlessly with custom chains", () => {
      const transport = alchemyTransport({ apiKey: "demo-key" });

      // Custom chain with ID that exists in registry
      const customChain = defineChain({
        id: 480, // worldChain
        name: "My World Chain",
        nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
        rpcUrls: {
          default: { http: ["https://my-world-chain.com"] },
        },
      });

      const customTransport = transport({ chain: customChain });
      expect(customTransport.value?.alchemyRpcUrl).toBe(
        "https://worldchain-mainnet.g.alchemy.com/v2",
      );
    });
  });
});
