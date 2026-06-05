import { describe, it, expect } from "vitest";
import {
  validateAlchemyConnectionConfig,
  isAlchemyConnectionConfig,
} from "../../src/transport/connectionSchema.js";
import { ConnectionConfigError } from "../../src/errors/ConnectionConfigError.js";

describe("AlchemyConnectionConfig V5 Schema", () => {
  describe("Direct Configuration", () => {
    it("should create valid API key config", () => {
      const config = { apiKey: "test-key" };
      const result = validateAlchemyConnectionConfig(config);
      expect(result).toEqual(config);
      expect(isAlchemyConnectionConfig(config)).toBe(true);
    });

    it("should create valid JWT config", () => {
      const config = { jwt: "test-jwt" };
      const result = validateAlchemyConnectionConfig(config);
      expect(result).toEqual(config);
      expect(isAlchemyConnectionConfig(config)).toBe(true);
    });

    it("should create valid URL config", () => {
      const config = { url: "https://eth-mainnet.g.alchemy.com/v2/test-key" };
      const result = validateAlchemyConnectionConfig(config);
      expect(result).toEqual(config);
      expect(isAlchemyConnectionConfig(config)).toBe(true);
    });
  });

  describe("Validation - Valid Configs", () => {
    it("should validate API key config", () => {
      const config = { apiKey: "test-key" };
      const result = validateAlchemyConnectionConfig(config);
      expect(result).toEqual(config);
      expect(isAlchemyConnectionConfig(config)).toBe(true);
    });

    it("should validate JWT config", () => {
      const config = { jwt: "test-jwt" };
      const result = validateAlchemyConnectionConfig(config);
      expect(result).toEqual(config);
      expect(isAlchemyConnectionConfig(config)).toBe(true);
    });

    it("should validate URL config", () => {
      const config = { url: "https://eth-mainnet.g.alchemy.com/v2/test-key" };
      const result = validateAlchemyConnectionConfig(config);
      expect(result).toEqual(config);
      expect(isAlchemyConnectionConfig(config)).toBe(true);
    });
  });

  describe("Validation - Invalid Configs", () => {
    it("should reject empty API key", () => {
      const config = { apiKey: "" };
      expect(() => validateAlchemyConnectionConfig(config)).toThrow(
        ConnectionConfigError,
      );
      expect(isAlchemyConnectionConfig(config)).toBe(false);
    });

    it("should reject empty JWT", () => {
      const config = { jwt: "" };
      expect(() => validateAlchemyConnectionConfig(config)).toThrow(
        ConnectionConfigError,
      );
      expect(isAlchemyConnectionConfig(config)).toBe(false);
    });

    it("should reject invalid URL formats", () => {
      const invalidUrls = [
        { url: "not-a-url" },
        { url: "" },
        { url: "//missing-protocol.com" },
      ];

      invalidUrls.forEach((config) => {
        expect(() => validateAlchemyConnectionConfig(config)).toThrow(
          ConnectionConfigError,
        );
        expect(isAlchemyConnectionConfig(config)).toBe(false);
      });
    });

    it("should reject config with no valid fields", () => {
      const config = { unknownField: "value" };
      expect(() => validateAlchemyConnectionConfig(config)).toThrow(
        ConnectionConfigError,
      );
      expect(isAlchemyConnectionConfig(config)).toBe(false);
    });

    it("should reject empty object", () => {
      const config = {};
      expect(() => validateAlchemyConnectionConfig(config)).toThrow(
        ConnectionConfigError,
      );
      expect(isAlchemyConnectionConfig(config)).toBe(false);
    });
  });

  describe("Flexible Configuration Behavior", () => {
    it("should reject config with both apiKey and jwt", () => {
      const config = {
        apiKey: "test-key",
        jwt: "test-jwt",
      } as any;

      // Should reject both auth methods together
      expect(() => validateAlchemyConnectionConfig(config)).toThrow(
        ConnectionConfigError,
      );
      expect(isAlchemyConnectionConfig(config)).toBe(false);
    });

    it("should allow url with apiKey", () => {
      const config = {
        url: "https://custom.alchemy.com/v2",
        apiKey: "test-key",
      };

      const result = validateAlchemyConnectionConfig(config);
      expect(result).toEqual(config);
      expect(isAlchemyConnectionConfig(config)).toBe(true);
    });

    it("should allow url with jwt", () => {
      const config = {
        url: "https://custom.alchemy.com/v2",
        jwt: "test-jwt",
      };

      const result = validateAlchemyConnectionConfig(config);
      expect(result).toEqual(config);
      expect(isAlchemyConnectionConfig(config)).toBe(true);
    });

    it("should reject config with unknown fields", () => {
      const config = {
        apiKey: "valid-key",
        invalidField: "ignored",
      } as any;

      // Should reject unknown fields due to strict validation
      expect(() => validateAlchemyConnectionConfig(config)).toThrow(
        ConnectionConfigError,
      );
      expect(isAlchemyConnectionConfig(config)).toBe(false);
    });

    it("should reject config with no valid fields", () => {
      const config = {};

      expect(() => validateAlchemyConnectionConfig(config)).toThrow(
        ConnectionConfigError,
      );
      expect(isAlchemyConnectionConfig(config)).toBe(false);
    });
  });

  describe("Type Guards", () => {
    it("should correctly identify valid configs", () => {
      expect(isAlchemyConnectionConfig({ apiKey: "test" })).toBe(true);
      expect(isAlchemyConnectionConfig({ jwt: "test" })).toBe(true);
      expect(isAlchemyConnectionConfig({ url: "https://example.com" })).toBe(
        true,
      );
    });

    it("should correctly identify invalid configs", () => {
      expect(isAlchemyConnectionConfig({})).toBe(false);
      expect(isAlchemyConnectionConfig(null)).toBe(false);
      expect(isAlchemyConnectionConfig(undefined)).toBe(false);
      expect(isAlchemyConnectionConfig("string")).toBe(false);
      expect(isAlchemyConnectionConfig(123)).toBe(false);
      expect(isAlchemyConnectionConfig(true)).toBe(false);
      expect(isAlchemyConnectionConfig([])).toBe(false);
      expect(isAlchemyConnectionConfig({ unknownField: "value" })).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(isAlchemyConnectionConfig({ apiKey: "" })).toBe(false); // Empty string
      expect(isAlchemyConnectionConfig({ apiKey: null } as any)).toBe(false); // Null value
      expect(isAlchemyConnectionConfig({ apiKey: 123 } as any)).toBe(false); // Wrong type
    });
  });

  describe("Error Messages", () => {
    it("should provide descriptive error for empty API key", () => {
      try {
        validateAlchemyConnectionConfig({ apiKey: "" });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error).toBeInstanceOf(ConnectionConfigError);
        expect(error.message).toContain("API key cannot be empty");
      }
    });

    it("should provide descriptive error for empty JWT", () => {
      try {
        validateAlchemyConnectionConfig({ jwt: "" });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error).toBeInstanceOf(ConnectionConfigError);
        expect(error.message).toContain("JWT cannot be empty");
      }
    });

    it("should provide descriptive error for invalid URL", () => {
      try {
        validateAlchemyConnectionConfig({ url: "not-a-url" });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error).toBeInstanceOf(ConnectionConfigError);
        expect(error.message).toContain("Invalid URL format");
      }
    });

    it("should provide error for missing fields", () => {
      try {
        validateAlchemyConnectionConfig({});
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error).toBeInstanceOf(ConnectionConfigError);
        expect(error.message).toContain("Invalid");
      }
    });

    it("should provide error for wrong type", () => {
      try {
        validateAlchemyConnectionConfig({ apiKey: 123 } as any);
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error).toBeInstanceOf(ConnectionConfigError);
        // Zod will report type mismatch
      }
    });
  });
});
