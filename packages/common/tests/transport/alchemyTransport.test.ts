import { describe, it, expect, vi } from "vitest";
import { avalanche, sepolia } from "viem/chains";
import {
  alchemyTransport,
  isAlchemyTransport,
} from "../../src/transport/alchemy.js";
import { http } from "viem";
import { createBundlerClient } from "viem/account-abstraction";

describe("Alchemy Transport Tests", () => {
  it.each([
    { url: "/api" },
    { jwt: "test" },
    { apiKey: "key" },
    { url: "https://custom.com", apiKey: "key" },
    { url: "https://custom.com", jwt: "token" },
  ])("should successfully create a transport", (args) => {
    expect(() =>
      alchemyTransport({
        ...args,
      }),
    ).not.toThrowError();
  });

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

    it("should create transport with custom URL and API key", () => {
      const transport = alchemyTransport({
        url: "https://custom-alchemy.com/v2",
        apiKey: "test-api-key",
      });

      expect(transport).toBeDefined();
      expect(typeof transport).toBe("function");
    });

    it("should create transport with custom URL and JWT", () => {
      const transport = alchemyTransport({
        url: "https://custom-alchemy.com/v2",
        jwt: "test-jwt-token",
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

    it("should accept HTTP debugging options", () => {
      const onFetchRequest = vi.fn();
      const onFetchResponse = vi.fn();

      const transport = alchemyTransport({
        apiKey: "test-key",
        httpOptions: {
          onFetchRequest,
          onFetchResponse,
          timeout: 30000,
        },
      });

      expect(transport).toBeDefined();
      expect(typeof transport).toBe("function");

      const result = transport({ chain: sepolia });
      expect(result).toBeDefined();
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

    it("should throw error when chain is not supported by Alchemy", () => {
      const transport = alchemyTransport({ apiKey: "test-key" });
      expect(() => transport({ chain: avalanche })).toThrowError(
        `Chain ${avalanche.id} (${avalanche.name}) is not supported by Alchemy`,
      );
    });

    it("should work with valid Alchemy-supported chain", () => {
      const transport = alchemyTransport({ apiKey: "test-key" });
      const result = transport({ chain: sepolia });

      expect(result).toBeDefined();
      expect(result.config.type).toBe("alchemyHttp");
      expect(result.config.key).toBe("alchemyHttp");
    });

    it("should extract RPC URL from registry for apiKey config", () => {
      const transport = alchemyTransport({ apiKey: "test-key" });
      const result = transport({ chain: sepolia });

      // Verify it's using the registry Alchemy RPC URL for sepolia
      expect(result.value?.alchemyRpcUrl).toBe(
        "https://eth-sepolia.g.alchemy.com/v2",
      );
    });

    it("should use direct URL ignoring chain", () => {
      const testUrl = "https://custom.alchemy.com/v2/custom-key";
      const transport = alchemyTransport({ url: testUrl });
      const result = transport({ chain: sepolia });

      // Should use the provided URL, not the chain's URL
      expect(result.value?.alchemyRpcUrl).toBe(testUrl);
    });

    it("should use custom URL with API key auth", () => {
      const testUrl = "https://custom-alchemy.com/v2";
      const transport = alchemyTransport({
        url: testUrl,
        apiKey: "test-key",
      });
      const result = transport({ chain: sepolia });

      // Should use the custom URL
      expect(result.value?.alchemyRpcUrl).toBe(testUrl);
    });

    it("should use custom URL with JWT auth", () => {
      const testUrl = "https://custom-alchemy.com/v2";
      const transport = alchemyTransport({
        url: testUrl,
        jwt: "test-jwt",
      });
      const result = transport({ chain: sepolia });

      // Should use the custom URL
      expect(result.value?.alchemyRpcUrl).toBe(testUrl);
    });

    it("should not require chain when using custom URL", () => {
      const transport = alchemyTransport({
        url: "https://custom-alchemy.com/v2",
        apiKey: "test-key",
      });

      // URL + auth config doesn't need chain - creates transport successfully
      const result = transport({} as any);
      expect(result).toBeDefined();
      expect(result.config.type).toBe("alchemyHttp");
    });
  });

  describe("Headers Management", () => {
    it("should add Authorization header when using custom URL with API key", () => {
      const transport = alchemyTransport({
        url: "https://custom-alchemy.com/v2",
        apiKey: "test-api-key",
      });

      const result = transport({ chain: sepolia });
      const headers = result.value?.fetchOptions?.headers as Record<
        string,
        string
      >;

      expect(headers).toBeDefined();
      expect(headers["Authorization"]).toBe("Bearer test-api-key");
      expect(headers["Alchemy-AA-Sdk-Version"]).toBeDefined();
    });

    it("should add Authorization header when using custom URL with JWT", () => {
      const transport = alchemyTransport({
        url: "https://custom-alchemy.com/v2",
        jwt: "test-jwt-token",
      });

      const result = transport({ chain: sepolia });
      const headers = result.value?.fetchOptions?.headers as Record<
        string,
        string
      >;

      expect(headers).toBeDefined();
      expect(headers["Authorization"]).toBe("Bearer test-jwt-token");
      expect(headers["Alchemy-AA-Sdk-Version"]).toBeDefined();
    });

    it("should not add Authorization header when using URL only", () => {
      const transport = alchemyTransport({
        url: "https://custom-endpoint.com/v2/with-embedded-key",
      });

      const result = transport({ chain: sepolia });
      const headers = result.value?.fetchOptions?.headers as Record<
        string,
        string
      >;

      expect(headers).toBeDefined();
      expect(headers["Authorization"]).toBeUndefined();
      expect(headers["Alchemy-AA-Sdk-Version"]).toBeDefined();
    });

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
      const headers = result.value?.fetchOptions?.headers as Record<
        string,
        string
      >;

      // Verify transport has correct metadata and headers
      expect(result.config).toBeDefined();
      expect(result.config.type).toBe("alchemyHttp");
      expect(result.config.name).toBe("Alchemy HTTP Transport");

      // Verify SDK version header is included
      expect(headers).toBeDefined();
      expect(headers["Alchemy-AA-Sdk-Version"]).toBeDefined();
      expect(headers["Authorization"]).toBe("Bearer test-key");
    });

    it("should not set authorization header for direct url", () => {
      const transport = alchemyTransport({
        url: "https://eth-mainnet.g.alchemy.com/v2/test-key",
      });

      const result = transport({ chain: sepolia });
      const headers = result.value?.fetchOptions?.headers as Record<
        string,
        string
      >;

      // URL config shouldn't add auth headers (auth is in the URL)
      expect(headers).toBeDefined();
      expect(headers["Authorization"]).toBeUndefined();
      expect(headers["Alchemy-AA-Sdk-Version"]).toBeDefined();
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
      const headers = result.value?.fetchOptions?.headers as Record<
        string,
        string
      >;

      expect(headers).toBeDefined();
      expect(headers["Authorization"]).toBe("Bearer test-key");
      expect(headers["Alchemy-AA-Sdk-Version"]).toBeDefined();
      expect(headers["X-Custom-Header"]).toBe("custom-value");
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
      `Chain ${avalanche.id} (${avalanche.name}) is not supported by Alchemy`,
    );
  });

  describe("Error Handling", () => {
    it("should handle config with both apiKey and jwt (JWT takes precedence)", () => {
      // This tests the transport behavior when schema validation is bypassed
      const transport = alchemyTransport({
        apiKey: "test-api-key",
        jwt: "test-jwt",
      } as any);

      const result = transport({ chain: sepolia });
      const headers = result.value?.fetchOptions?.headers as Record<
        string,
        string
      >;

      // JWT should take precedence over apiKey (based on implementation logic)
      expect(headers["Authorization"]).toBe("Bearer test-jwt");
      expect(headers["Alchemy-AA-Sdk-Version"]).toBeDefined();
    });

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
        expect(error.message).toContain(
          `Chain ${avalanche.id} (${avalanche.name}) is not supported by Alchemy`,
        );
        expect(error.message).toContain("alchemyTransport({ url:");
        expect(error.message).toContain("defineChain({ rpcUrls: { alchemy:");
        expect(error.message).toContain("http(");
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

  describe("Comprehensive Header Verification", () => {
    it.each([
      {
        name: "API key only",
        config: { apiKey: "test-api-key" },
        expectedAuth: "Bearer test-api-key",
        needsChain: true,
      },
      {
        name: "JWT only",
        config: { jwt: "test-jwt" },
        expectedAuth: "Bearer test-jwt",
        needsChain: true,
      },
      {
        name: "URL only",
        config: { url: "https://custom.com/v2" },
        expectedAuth: undefined,
        needsChain: false,
      },
      {
        name: "URL + API key",
        config: { url: "https://custom.com/v2", apiKey: "test-api-key" },
        expectedAuth: "Bearer test-api-key",
        needsChain: false,
      },
      {
        name: "URL + JWT",
        config: { url: "https://custom.com/v2", jwt: "test-jwt" },
        expectedAuth: "Bearer test-jwt",
        needsChain: false,
      },
    ])(
      "should handle $name with correct headers",
      ({ config, expectedAuth, needsChain }) => {
        const transport = alchemyTransport(config);
        const chainArg = needsChain ? { chain: sepolia } : {};
        const result = transport(chainArg);
        const headers = result.value?.fetchOptions?.headers as Record<
          string,
          string
        >;

        expect(headers).toBeDefined();
        expect(headers["Alchemy-AA-Sdk-Version"]).toBeDefined();

        if (expectedAuth) {
          expect(headers["Authorization"]).toBe(expectedAuth);
        } else {
          expect(headers["Authorization"]).toBeUndefined();
        }
      },
    );
  });

  describe("Retry Count", () => {
    it.each([0, 1, 2, 3])(
      "respects retryCount of %i when used with a viem bundler client",
      async (retryCount) => {
        const { mockFetch, unstub } = givenMockFetchError();

        const client = createBundlerClient({
          transport: alchemyTransport({
            url: "http://invalid",
            retryCount,
          }),
          chain: sepolia,
        });

        await expect(
          client.request({
            // @ts-expect-error - Method doesn't matter for this test.
            method: "eth_blockNumber",
          }),
        ).rejects.toThrow();

        expect(mockFetch.mock.calls.length).toEqual(retryCount + 1);
        unstub();
      },
    );

    it.each([0, 1, 2, 3])(
      "respects retryCount of %i when used with alchemy transport directly",
      async (retryCount) => {
        const { mockFetch, unstub } = givenMockFetchError();

        const transport = alchemyTransport({
          apiKey: "invalid",
          retryCount,
        });

        const transportInstance = transport({ chain: sepolia });

        await expect(
          transportInstance.request({
            method: "eth_blockNumber",
          }),
        ).rejects.toThrow();

        expect(mockFetch.mock.calls.length).toEqual(retryCount + 1);
        unstub();
      },
    );
  });

  // Mocks global fetch to always return a 500 error.
  const givenMockFetchError = () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: () => Promise.resolve({ error: "Internal Server Error" }),
      text: () => Promise.resolve("Internal Server Error"),
    });
    vi.stubGlobal("fetch", mockFetch);
    return {
      mockFetch,
      unstub: () => vi.unstubAllGlobals(),
    };
  };
});
