import { describe, it, expect } from "vitest";
import { 
  validateAlchemyConnectionConfig, 
  isAlchemyConnectionConfig,
  createApiKeyConfig,
  createJwtConfig,
  createProxyConfig,
  createRpcUrlConfig,
  createProxyUrlConfig
} from "../../src/transport/connectionSchema.js";
import { ConnectionConfigError } from "../../src/errors/ConnectionConfigError.js";

describe("AlchemyConnectionConfig Schema", () => {
  describe("Factory Functions", () => {
    it("should create valid API key config", () => {
      const config = createApiKeyConfig("test-key");
      expect(config).toEqual({
        mode: "apiKey",
        apiKey: "test-key"
      });
    });

    it("should create valid API key config with nodeRpcUrl", () => {
      const config = createApiKeyConfig("test-key", {
        nodeRpcUrl: "https://zora.rpc.com"
      });
      expect(config).toEqual({
        mode: "apiKey",
        apiKey: "test-key",
        nodeRpcUrl: "https://zora.rpc.com"
      });
    });

    it("should create valid API key config with chainAgnosticUrl", () => {
      const config = createApiKeyConfig("test-key", {
        chainAgnosticUrl: "https://api.g.alchemy.com/v2"
      });
      expect(config).toEqual({
        mode: "apiKey",
        apiKey: "test-key",
        chainAgnosticUrl: "https://api.g.alchemy.com/v2"
      });
    });

    it("should create valid JWT config", () => {
      const config = createJwtConfig("test-jwt");
      expect(config).toEqual({
        mode: "jwt", 
        jwt: "test-jwt"
      });
    });

    it("should create valid JWT config with nodeRpcUrl", () => {
      const config = createJwtConfig("test-jwt", {
        nodeRpcUrl: "https://base.rpc.com"
      });
      expect(config).toEqual({
        mode: "jwt",
        jwt: "test-jwt",
        nodeRpcUrl: "https://base.rpc.com"
      });
    });

    it("should create valid proxy config", () => {
      const config = createProxyConfig("https://proxy.example.com");
      expect(config).toEqual({
        mode: "proxy",
        proxyUrl: "https://proxy.example.com"
      });
    });

    it("should create valid proxy config with nodeRpcUrl", () => {
      const config = createProxyConfig("https://proxy.example.com", {
        nodeRpcUrl: "https://zora.rpc.com"
      });
      expect(config).toEqual({
        mode: "proxy",
        proxyUrl: "https://proxy.example.com",
        nodeRpcUrl: "https://zora.rpc.com"
      });
    });

    it("should handle deprecated createRpcUrlConfig", () => {
      const config = createRpcUrlConfig("https://rpc.example.com");
      expect(config).toEqual({
        mode: "proxy",
        proxyUrl: "https://rpc.example.com"
      });
    });

    it("should handle deprecated createProxyUrlConfig", () => {
      const config = createProxyUrlConfig("https://proxy.example.com");
      expect(config).toEqual({
        mode: "proxy",
        proxyUrl: "https://proxy.example.com"
      });
    });
  });

  describe("Validation", () => {
    it("should validate API key config", () => {
      const config = { mode: "apiKey" as const, apiKey: "test-key" };
      expect(() => validateAlchemyConnectionConfig(config)).not.toThrow();
      expect(isAlchemyConnectionConfig(config)).toBe(true);
    });

    it("should validate API key config with nodeRpcUrl", () => {
      const config = { 
        mode: "apiKey" as const, 
        apiKey: "test-key",
        nodeRpcUrl: "https://zora.rpc.com"
      };
      expect(() => validateAlchemyConnectionConfig(config)).not.toThrow();
      expect(isAlchemyConnectionConfig(config)).toBe(true);
    });

    it("should validate JWT config", () => {
      const config = { mode: "jwt" as const, jwt: "test-jwt" };
      expect(() => validateAlchemyConnectionConfig(config)).not.toThrow();
      expect(isAlchemyConnectionConfig(config)).toBe(true);
    });

    it("should validate JWT config with nodeRpcUrl", () => {
      const config = { 
        mode: "jwt" as const, 
        jwt: "test-jwt",
        nodeRpcUrl: "https://base.rpc.com"
      };
      expect(() => validateAlchemyConnectionConfig(config)).not.toThrow();
      expect(isAlchemyConnectionConfig(config)).toBe(true);
    });

    it("should validate proxy config", () => {
      const config = { 
        mode: "proxy" as const, 
        proxyUrl: "https://proxy.example.com" 
      };
      expect(() => validateAlchemyConnectionConfig(config)).not.toThrow();
      expect(isAlchemyConnectionConfig(config)).toBe(true);
    });

    it("should validate proxy config with nodeRpcUrl", () => {
      const config = { 
        mode: "proxy" as const, 
        proxyUrl: "https://proxy.example.com",
        nodeRpcUrl: "https://zora.rpc.com"
      };
      expect(() => validateAlchemyConnectionConfig(config)).not.toThrow();
      expect(isAlchemyConnectionConfig(config)).toBe(true);
    });

    it("should reject invalid mode type", () => {
      const config = { mode: "invalid", someField: "value" };
      expect(() => validateAlchemyConnectionConfig(config)).toThrow(ConnectionConfigError);
      expect(isAlchemyConnectionConfig(config)).toBe(false);
    });

    it("should reject apiKey config with missing apiKey field", () => {
      const config = { mode: "apiKey" }; // missing apiKey field
      expect(() => validateAlchemyConnectionConfig(config)).toThrow(ConnectionConfigError);
      expect(isAlchemyConnectionConfig(config)).toBe(false);
    });

    it("should reject jwt config with missing jwt field", () => {
      const config = { mode: "jwt" }; // missing jwt field
      expect(() => validateAlchemyConnectionConfig(config)).toThrow(ConnectionConfigError);
      expect(isAlchemyConnectionConfig(config)).toBe(false);
    });

    it("should reject proxy config with missing proxyUrl field", () => {
      const config = { mode: "proxy" }; // missing proxyUrl field
      expect(() => validateAlchemyConnectionConfig(config)).toThrow(ConnectionConfigError);
      expect(isAlchemyConnectionConfig(config)).toBe(false);
    });

    it("should reject empty apiKey", () => {
      const config = { mode: "apiKey" as const, apiKey: "" };
      expect(() => validateAlchemyConnectionConfig(config)).toThrow(ConnectionConfigError);
      expect(isAlchemyConnectionConfig(config)).toBe(false);
    });

    it("should reject empty jwt", () => {
      const config = { mode: "jwt" as const, jwt: "" };
      expect(() => validateAlchemyConnectionConfig(config)).toThrow(ConnectionConfigError);
      expect(isAlchemyConnectionConfig(config)).toBe(false);
    });

    it("should reject invalid URL formats", () => {
      const invalidUrls = [
        { mode: "proxy" as const, proxyUrl: "not-a-url" },
        { mode: "apiKey" as const, apiKey: "test", nodeRpcUrl: "invalid" },
        { mode: "jwt" as const, jwt: "test", chainAgnosticUrl: "bad-url" }
      ];

      invalidUrls.forEach(config => {
        expect(() => validateAlchemyConnectionConfig(config)).toThrow(ConnectionConfigError);
        expect(isAlchemyConnectionConfig(config)).toBe(false);
      });
    });
  });

  describe("Error Messages", () => {
    it("should throw ConnectionConfigError for invalid config", () => {
      expect(() => {
        validateAlchemyConnectionConfig({ mode: "apiKey" }); // missing apiKey
      }).toThrow(ConnectionConfigError);
    });

    it("should provide descriptive error for missing fields", () => {
      try {
        validateAlchemyConnectionConfig({ mode: "apiKey" });
      } catch (error) {
        expect(error).toBeInstanceOf(ConnectionConfigError);
        expect(error.message).toContain("Required");
      }
    });

    it("should provide descriptive error for invalid URLs", () => {
      try {
        validateAlchemyConnectionConfig({ 
          mode: "proxy" as const, 
          proxyUrl: "not-a-url" 
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ConnectionConfigError);
        expect(error.message).toContain("Invalid");
      }
    });
  });

  describe("Type Narrowing", () => {
    it("should narrow types correctly with type guard", () => {
      const unknownConfig: unknown = { mode: "apiKey", apiKey: "test" };
      
      if (isAlchemyConnectionConfig(unknownConfig)) {
        // TypeScript should know the type here
        expect(unknownConfig.mode).toBe("apiKey");
        if (unknownConfig.mode === "apiKey") {
          expect(unknownConfig.apiKey).toBe("test");
        }
      }
    });
  });
});