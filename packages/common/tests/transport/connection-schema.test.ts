import { describe, it, expect } from "vitest";
import { 
  validateAlchemyConnectionConfig, 
  isAlchemyConnectionConfig,
  createApiKeyConfig,
  createJwtConfig,
  createRpcUrlConfig
} from "../../src/transport/connection-schema.js";
import { ConnectionConfigError } from "../../src/errors/ConnectionConfigError.js";

describe("AlchemyConnectionConfig Schema", () => {
  describe("Factory Functions", () => {
    it("should create valid API key config", () => {
      const config = createApiKeyConfig("test-key");
      expect(config).toEqual({
        type: "apiKey",
        apiKey: "test-key"
      });
    });

    it("should create valid JWT config", () => {
      const config = createJwtConfig("test-jwt");
      expect(config).toEqual({
        type: "jwt", 
        jwt: "test-jwt"
      });
    });

    it("should create valid RPC URL config", () => {
      const config = createRpcUrlConfig("https://rpc.example.com");
      expect(config).toEqual({
        type: "rpcUrl",
        rpcUrl: "https://rpc.example.com"
      });
    });


  });

  describe("Validation", () => {
    it("should validate API key config", () => {
      const config = { type: "apiKey" as const, apiKey: "test-key" };
      expect(() => validateAlchemyConnectionConfig(config)).not.toThrow();
      expect(isAlchemyConnectionConfig(config)).toBe(true);
    });

    it("should validate JWT config", () => {
      const config = { type: "jwt" as const, jwt: "test-jwt" };
      expect(() => validateAlchemyConnectionConfig(config)).not.toThrow();
      expect(isAlchemyConnectionConfig(config)).toBe(true);
    });

    it("should validate AA-only config", () => {
      const config = {
        type: "aaOnly" as const,
        alchemyConnection: { type: "apiKey" as const, apiKey: "test-key" },
        nodeRpcUrl: "https://node.example.com"
      };
      expect(() => validateAlchemyConnectionConfig(config)).not.toThrow();
      expect(isAlchemyConnectionConfig(config)).toBe(true);
    });

    it("should reject invalid config", () => {
      const config = { type: "invalid", someField: "value" };
      expect(() => validateAlchemyConnectionConfig(config)).toThrow(ConnectionConfigError);
      expect(isAlchemyConnectionConfig(config)).toBe(false);
    });

    it("should reject config with missing required fields", () => {
      const config = { type: "apiKey" }; // missing apiKey field
      expect(() => validateAlchemyConnectionConfig(config)).toThrow(ConnectionConfigError);
      expect(isAlchemyConnectionConfig(config)).toBe(false);
    });
  });

  describe("Error Messages", () => {
    it("should throw ConnectionConfigError for invalid config", () => {
      expect(() => {
        validateAlchemyConnectionConfig({ type: "apiKey" }); // missing apiKey
      }).toThrow(ConnectionConfigError);
    });
  });
});