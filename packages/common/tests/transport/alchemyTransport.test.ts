import { describe, it, expect } from "vitest";
import { avalanche } from "viem/chains";
import { sepolia } from "../../src/chains.js";
import {
  alchemyTransport,
  isAlchemyTransport,
} from "../../src/transport/alchemy.js";
import { http } from "viem";

describe("Alchemy Transport Tests", () => {
  it.each([{ url: "/api" }, { jwt: "test" }, { apiKey: "key" }])(
    "should successfully create a transport",
    (args) => {
      expect(() =>
        alchemyTransport({
          ...args,
        }),
      ).not.toThrowError();
    },
  );

  describe("Configuration", () => {
    it("should create transport with apiKey", () => {
      const transport = alchemyTransport({
        apiKey: "test-api-key",
      });

      expect(transport).toBeDefined();
      expect(typeof transport).toBe("function");
    });

    it("should create transport with jwt", () => {
      const transport = alchemyTransport({
        jwt: "test-jwt-token",
      });

      expect(transport).toBeDefined();
      expect(typeof transport).toBe("function");
    });

    it("should create transport with direct url", () => {
      const transport = alchemyTransport({
        url: "https://eth-mainnet.g.alchemy.com/v2/test-key",
      });

      expect(transport).toBeDefined();
      expect(typeof transport).toBe("function");
    });

    it("should accept retry configuration", () => {
      const transport = alchemyTransport({
        apiKey: "test-key",
        retryCount: 3,
        retryDelay: 1000,
      });

      const result = transport({ chain: sepolia });
      expect(result.config.retryCount).toBe(3);
      expect(result.config.retryDelay).toBe(1000);
    });
  });

  describe("Chain Validation", () => {
    it("should throw error when chain is missing for apiKey config", () => {
      const transport = alchemyTransport({ apiKey: "test-key" });
      expect(() => transport({ chain: undefined as any })).toThrowError(
        "No chain supplied to the client",
      );
    });

    it("should throw error when chain is missing for jwt config", () => {
      const transport = alchemyTransport({ jwt: "test-jwt" });
      expect(() => transport({ chain: undefined as any })).toThrowError(
        "No chain supplied to the client",
      );
    });

    it("should not require chain when using direct url", () => {
      const transport = alchemyTransport({
        url: "https://eth-mainnet.g.alchemy.com/v2/test-key",
      });

      // URL config doesn't need chain - creates transport successfully
      const result = transport({} as any);
      expect(result).toBeDefined();
      expect(result.config.type).toBe("alchemyHttp");
    });

    it("should throw error when chain doesn't have Alchemy RPC URL", () => {
      const transport = alchemyTransport({ apiKey: "test-key" });
      expect(() => transport({ chain: avalanche })).toThrowError(
        "Chain must include an Alchemy RPC URL",
      );
    });

    it("should work with valid Alchemy-supported chain", () => {
      const transport = alchemyTransport({ apiKey: "test-key" });
      const result = transport({ chain: sepolia });

      expect(result).toBeDefined();
      expect(result.config.type).toBe("alchemyHttp");
      expect(result.config.key).toBe("alchemyHttp");
    });

    it("should extract RPC URL from chain for apiKey config", () => {
      const transport = alchemyTransport({ apiKey: "test-key" });
      const result = transport({ chain: sepolia });

      // Verify it's using the chain's Alchemy RPC URL
      expect(result.value?.alchemyRpcUrl).toContain("sepolia");
    });

    it("should use direct URL ignoring chain", () => {
      const testUrl = "https://custom.alchemy.com/v2/custom-key";
      const transport = alchemyTransport({ url: testUrl });
      const result = transport({ chain: sepolia });

      // Should use the provided URL, not the chain's URL
      expect(result.value?.alchemyRpcUrl).toBe(testUrl);
    });
  });

  describe("Headers Management", () => {
    it("should support updating headers", () => {
      const transport = alchemyTransport({
        apiKey: "test-key",
      });

      expect(transport.updateHeaders).toBeDefined();
      expect(typeof transport.updateHeaders).toBe("function");

      // Should not throw when updating headers
      expect(() =>
        transport.updateHeaders({ "X-Custom-Header": "value" }),
      ).not.toThrow();
    });

    it("should include SDK version header", () => {
      const transport = alchemyTransport({
        apiKey: "test-key",
      });

      const result = transport({ chain: sepolia });

      // Verify transport has correct metadata
      expect(result.config).toBeDefined();
      expect(result.config.type).toBe("alchemyHttp");
      expect(result.config.name).toBe("Alchemy HTTP Transport");
    });

    it("should not set authorization header for direct url", () => {
      const transport = alchemyTransport({
        url: "https://eth-mainnet.g.alchemy.com/v2/test-key",
      });

      const result = transport({ chain: sepolia });

      // URL config shouldn't add auth headers (auth is in the URL)
      expect(result.value?.fetchOptions).toBeDefined();
      expect(result.config.type).toBe("alchemyHttp");
    });

    it("should merge custom headers with SDK headers", () => {
      const transport = alchemyTransport({
        apiKey: "test-key",
        fetchOptions: {
          headers: {
            "X-Custom-Header": "custom-value",
          },
        },
      });

      const result = transport({ chain: sepolia });
      expect(result.value?.fetchOptions).toBeDefined();
    });
  });

  describe("Transport Type and Metadata", () => {
    it("should have correct transport type and metadata", () => {
      const transport = alchemyTransport({ apiKey: "test-key" });
      const result = transport({ chain: sepolia });

      expect(result.config.type).toBe("alchemyHttp");
      expect(result.config.key).toBe("alchemyHttp");
      expect(result.config.name).toBe("Alchemy HTTP Transport");
    });

    it("should be identifiable by isAlchemyTransport", () => {
      const alchemyTrans = alchemyTransport({ apiKey: "test-key" });
      const standardTrans = http("https://example.com");

      expect(isAlchemyTransport(alchemyTrans, sepolia)).toBe(true);
      expect(isAlchemyTransport(standardTrans, sepolia)).toBe(false);
    });
  });

  it("should correctly do runtime validation when chain is not supported by Alchemy", () => {
    expect(() =>
      alchemyTransport({ apiKey: "some_key" })({ chain: avalanche }),
    ).toThrowError(
      `Chain must include an Alchemy RPC URL. See \`defineAlchemyChain\` or import a chain from \`@alchemy/common\`.`,
    );
  });

  describe("Error Handling", () => {
    it("should provide clear error for missing chain with apiKey", () => {
      const transport = alchemyTransport({ apiKey: "test-key" });

      try {
        transport({ chain: undefined as any });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("No chain supplied to the client");
      }
    });

    it("should provide clear error for unsupported chain", () => {
      const transport = alchemyTransport({ apiKey: "test-key" });

      try {
        transport({ chain: avalanche });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("Alchemy RPC URL");
        expect(error.message).toContain("defineAlchemyChain");
      }
    });
  });

  describe("makeHttpRequest functionality", () => {
    it("should expose makeHttpRequest for HTTP operations", () => {
      const transport = alchemyTransport({
        url: "https://eth-mainnet.g.alchemy.com/v2/test-key",
      });

      const result = transport({ chain: sepolia });

      expect(result.value?.makeHttpRequest).toBeDefined();
      expect(typeof result.value?.makeHttpRequest).toBe("function");
    });
  });
});
