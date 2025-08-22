import { describe, it, expect } from "vitest";
import { storyMainnet, fraxtalSepolia } from "../../src/chains.js";
import { alchemyTransport } from "../../src/transport/alchemy.js";

describe("Custom Chains Tests", () => {
  describe("General Functionality", () => {
    it("should export custom chains with valid structure", () => {
      // Test a sample custom chain
      expect(storyMainnet).toBeDefined();
      expect(storyMainnet.id).toBeTypeOf("number");
      expect(storyMainnet.id).toBeGreaterThan(0);
      expect(storyMainnet.name).toBeTypeOf("string");
      expect(storyMainnet.nativeCurrency).toBeDefined();
      expect(storyMainnet.rpcUrls.default.http).toBeDefined();
      expect(storyMainnet.rpcUrls.default.http.length).toBeGreaterThan(0);
    });

    it("should work with alchemyTransport when registry supported", () => {
      const transport = alchemyTransport({ apiKey: "test-key" });

      // This should work if storyMainnet is in the registry
      const chainTransport = transport({ chain: storyMainnet });
      expect(chainTransport.value?.alchemyRpcUrl).toBeDefined();
    });

    it("should work with explicit URL for any custom chain", () => {
      const customUrl = "https://custom-alchemy-endpoint.com/v2/key";
      const transport = alchemyTransport({
        apiKey: "test-key",
        url: customUrl,
      });

      const chainTransport = transport({ chain: fraxtalSepolia });
      expect(chainTransport.value?.alchemyRpcUrl).toBe(customUrl);
    });

    it("should have testnet flag on testnet chains", () => {
      expect(fraxtalSepolia.testnet).toBe(true);
      expect(storyMainnet.testnet).toBeFalsy();
    });
  });
});
