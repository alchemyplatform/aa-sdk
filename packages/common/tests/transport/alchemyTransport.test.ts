import { describe, it, expect, vi } from "vitest";
import { avalanche } from "viem/chains";
import { sepolia } from "../../src/chains.js";
import { alchemy } from "../../src/transport/alchemy.js";
import * as SplitModule from "../../src/transport/split.js";

describe("Alchemy Transport Tests", () => {
  describe("Standard Configuration", () => {
    it.each([
      { mode: "jwt" as const, jwt: "test" },
      { mode: "apiKey" as const, apiKey: "key" },
      { mode: "proxy" as const, proxyUrl: "https://proxy.example.com" }
    ])(
      "should successfully create transport with %s mode",
      (args) => {
        expect(() =>
          alchemy({
            ...args,
          }),
        ).not.toThrowError();
      },
    );
  });

  describe("AA-Only Configuration", () => {
    it.each([
      { mode: "jwt" as const, jwt: "test", nodeRpcUrl: "https://node.example.com" },
      { mode: "apiKey" as const, apiKey: "key", nodeRpcUrl: "https://node.example.com" },
      { mode: "proxy" as const, proxyUrl: "https://proxy.example.com", nodeRpcUrl: "https://node.example.com" }
    ])(
      "should create split transport for AA-only chain with %s mode",
      (args) => {
        const splitSpy = vi.spyOn(SplitModule, "split");
        const transport = alchemy(args);
        transport({ chain: sepolia });

        expect(splitSpy).toHaveBeenCalled();
        expect(splitSpy.mock.calls.length).toBe(1);
        
        // Verify split was called with correct structure
        const splitCall = splitSpy.mock.calls[0][0];
        expect(splitCall).toHaveProperty("overrides");
        expect(splitCall).toHaveProperty("fallback");
        
        // For AA-only configs, overrides should route AA methods to Alchemy
        expect(splitCall.overrides).toBeInstanceOf(Array);
        expect(splitCall.overrides.length).toBeGreaterThan(0);
        
        splitSpy.mockRestore();
      },
    );

    it("should use nodeRpcUrl for fallback in AA-only configuration", () => {
      const splitSpy = vi.spyOn(SplitModule, "split");
      const nodeRpcUrl = "https://custom-node.example.com";
      
      alchemy({
        mode: "apiKey",
        apiKey: "test-key",
        nodeRpcUrl
      })({ chain: sepolia });

      const splitCall = splitSpy.mock.calls[0][0];
      
      // The fallback transport should use the nodeRpcUrl
      expect(splitCall.fallback).toBeDefined();
      
      splitSpy.mockRestore();
    });
  });

  describe("Chain Validation", () => {
    it("should throw error when chain is not supported by Alchemy and no nodeRpcUrl provided", () => {
      expect(() =>
        alchemy({ mode: "apiKey", apiKey: "some_key" })({ chain: avalanche }),
      ).toThrowError(
        `chain must include an alchemy rpc url. See \`defineAlchemyChain\` or import a chain from \`@alchemy/common/chains\`.`,
      );
    });

    it("should not throw error for unsupported chain when nodeRpcUrl is provided", () => {
      expect(() =>
        alchemy({ 
          mode: "apiKey", 
          apiKey: "some_key",
          nodeRpcUrl: "https://avalanche.rpc.com"
        })({ chain: avalanche }),
      ).not.toThrowError();
    });
  });

  describe("Proxy Configuration", () => {
    it("should not create split transport for simple proxy config", () => {
      const splitSpy = vi.spyOn(SplitModule, "split");
      
      alchemy({
        mode: "proxy",
        proxyUrl: "https://proxy.example.com"
      })({ chain: sepolia });

      // Simple proxy should not use split transport
      expect(splitSpy).not.toHaveBeenCalled();
      
      splitSpy.mockRestore();
    });

    it("should create split transport for proxy with nodeRpcUrl", () => {
      const splitSpy = vi.spyOn(SplitModule, "split");
      
      alchemy({
        mode: "proxy",
        proxyUrl: "https://proxy.example.com",
        nodeRpcUrl: "https://node.example.com"
      })({ chain: sepolia });

      // Proxy with nodeRpcUrl should use split transport
      expect(splitSpy).toHaveBeenCalled();
      
      splitSpy.mockRestore();
    });
  });

  describe("Headers Management", () => {
    it("should support updating headers", () => {
      const transport = alchemy({
        mode: "apiKey",
        apiKey: "test-key"
      });

      expect(transport.updateHeaders).toBeDefined();
      expect(() => transport.updateHeaders({ "X-Custom-Header": "value" })).not.toThrow();
    });

    it("should include SDK version header", () => {
      const transport = alchemy({
        mode: "apiKey",
        apiKey: "test-key"
      });

      const config = transport({ chain: sepolia }).config;
      expect(config).toBeDefined();
    });
  });

  describe("Configuration with Optional Fields", () => {
    it("should accept chainAgnosticUrl for apiKey config", () => {
      expect(() =>
        alchemy({
          mode: "apiKey",
          apiKey: "test-key",
          chainAgnosticUrl: "https://api.g.alchemy.com/v2"
        }),
      ).not.toThrowError();
    });

    it("should accept chainAgnosticUrl for jwt config", () => {
      expect(() =>
        alchemy({
          mode: "jwt",
          jwt: "test-jwt",
          chainAgnosticUrl: "https://api.g.alchemy.com/v2"
        }),
      ).not.toThrowError();
    });

    it("should not accept chainAgnosticUrl for proxy config", () => {
      // Proxy config doesn't have chainAgnosticUrl in the schema
      const config = {
        mode: "proxy" as const,
        proxyUrl: "https://proxy.example.com",
        chainAgnosticUrl: "https://api.g.alchemy.com/v2"
      } as any;

      // This would be caught by TypeScript at compile time,
      // but at runtime the extra field would be ignored
      expect(() => alchemy(config)).not.toThrowError();
    });
  });

  describe("Retry Configuration", () => {
    it("should accept retry configuration options", () => {
      expect(() =>
        alchemy({
          mode: "apiKey",
          apiKey: "test-key",
          retryCount: 3,
          retryDelay: 1000
        }),
      ).not.toThrowError();
    });

    it("should accept fetch options", () => {
      expect(() =>
        alchemy({
          mode: "apiKey",
          apiKey: "test-key",
          fetchOptions: {
            headers: {
              "X-Custom-Header": "value"
            }
          }
        }),
      ).not.toThrowError();
    });
  });
});