import { z } from "zod";
import { ConnectionConfigError } from "../errors/ConnectionConfigError.js";
import type { Never } from "../utils/types.js";
import type { SplitTransportParams } from "./split.js";

/**
 * V5 Connection Configuration Schema using discriminated unions. 
 */

// V4 legacy types needed for escape hatch compatibility
type AlchemyConnectionBaseConfig =
  | { proxyUrl: string; apiKey?: never; jwt?: never }
  | { proxyUrl?: never; apiKey: string; jwt?: never }
  | { proxyUrl?: never; apiKey?: never; jwt: string };

type AAOnlyChainConfig = {
  alchemyConnection: AlchemyConnectionBaseConfig;
  nodeRpcUrl: string;
};

// V4 escape hatch type for complex split transport scenarios
type AlchemyConnectionConfigEscapeHatch = SplitTransportParams & {
  restConnection: AlchemyConnectionConfig;
} & Never<AlchemyConnectionBaseConfig> & Never<AAOnlyChainConfig>;

const ApiKeyAuthSchema = z.object({
  type: z.literal('apiKey'),
  apiKey: z.string().min(1, 'API key cannot be empty'),
});

const JwtAuthSchema = z.object({
  type: z.literal('jwt'), 
  jwt: z.string().min(1, 'JWT cannot be empty'),
});

const ApiKeyConnectionSchema = ApiKeyAuthSchema.extend({
  chainAgnosticUrl: z.string().url().optional(),
});

const JwtConnectionSchema = JwtAuthSchema.extend({
  chainAgnosticUrl: z.string().url().optional(),
});

const RpcUrlConnectionSchema = z.object({
  type: z.literal('rpcUrl'),
  rpcUrl: z.string().url('Invalid RPC URL format'),
  chainAgnosticUrl: z.string().url().optional(),
});

// AA-only chain configuration (requires both Alchemy connection and external node RPC)
const AAOnlyConnectionSchema = z.object({
  type: z.literal('aaOnly'),
  alchemyConnection: z.discriminatedUnion('type', [
    ApiKeyAuthSchema,
    JwtAuthSchema,
  ]),
  nodeRpcUrl: z.string().url('Invalid node RPC URL format'),
  chainAgnosticUrl: z.string().url().optional(),
});

/**
 * Main discriminated union for all connection configuration types.
 * 
 * Uses a discriminated union for O(1) validation performance and clear error messages.
 * Each connection type is self-contained and explicitly typed.
 * 
 * TODO: Add support for complex escape hatch with SplitTransportParams.
 * Current discriminated union approach doesn't support the V4 escape hatch:
 * ```
 * SplitTransportParams & {
 *   restConnection: AlchemyConnectionConfig;
 * } & Never<AlchemyConnectionBaseConfig> & Never<AAOnlyChainConfig>
 * ```
 * 
 * Recommended approach: Hybrid pattern with separate AlchemyTransportConfig type
 * that unions the discriminated union with the complex escape hatch type.
 * This preserves clean validation for 95% of cases while maintaining advanced functionality.
 */
export const AlchemyConnectionConfigSchema = z.discriminatedUnion('type', [
  ApiKeyConnectionSchema,
  JwtConnectionSchema, 
  RpcUrlConnectionSchema,
  AAOnlyConnectionSchema,
]);

/**
 * TypeScript type derived from the schema for external consumption.
 * This provides clean type inference without exposing Zod implementation details.
 */
export type AlchemyConnectionConfig = z.infer<typeof AlchemyConnectionConfigSchema>;

/**
 * Hybrid transport configuration type that supports both:
 * 1. Clean V5 discriminated union (95% of use cases)
 * 2. Complex V4 escape hatch for advanced split transport scenarios
 * 
 * This maintains backward compatibility while providing the benefits of discriminated unions
 * for common configurations.
 */
export type AlchemyTransportConfig = AlchemyConnectionConfig | AlchemyConnectionConfigEscapeHatch;

/**
 * Validation function for Alchemy connection configuration.
 * 
 * @param {unknown} config The configuration object to validate
 * @returns {AlchemyConnectionConfig} Validated configuration object
 * @throws {ConnectionConfigError} If configuration is invalid
 */
export function validateAlchemyConnectionConfig(config: unknown): AlchemyConnectionConfig {
  const result = AlchemyConnectionConfigSchema.safeParse(config);
  
  if (!result.success) {
    const firstError = result.error.issues[0];
    const details = firstError?.message;
    throw new ConnectionConfigError(details);
  }
  
  return result.data;
}

/**
 * Type guard to check if a value is a valid Alchemy connection config.
 * 
 * @param {unknown} value The value to check for validity
 * @returns {boolean} True if the value is a valid Alchemy connection config, false otherwise
 */
export function isAlchemyConnectionConfig(value: unknown): value is AlchemyConnectionConfig {
  return AlchemyConnectionConfigSchema.safeParse(value).success;
}

/**
 * Validates if a value is a valid escape hatch configuration.
 * This checks for the complex V4 split transport pattern.
 * 
 * @param {unknown} value The value to check
 * @returns {boolean} True if the value matches the escape hatch pattern
 */
function isEscapeHatchConfig(value: unknown): value is AlchemyConnectionConfigEscapeHatch {
  if (!value || typeof value !== 'object') return false;
  
  const config = value as Record<string, unknown>;
  
  // Must have SplitTransportParams properties
  if (!Array.isArray(config.overrides) || !config.fallback) return false;
  
  // Must have restConnection
  if (!config.restConnection || typeof config.restConnection !== 'object') return false;
  
  // Must not have AlchemyConnectionBaseConfig properties (Never<> constraint)
  if (config.apiKey || config.jwt || config.proxyUrl) return false;
  
  // Must not have AAOnlyChainConfig properties (Never<> constraint)  
  if (config.alchemyConnection || config.nodeRpcUrl) return false;
  
  // Validate that restConnection is a valid AlchemyConnectionConfig
  return isAlchemyConnectionConfig(config.restConnection);
}

/**
 * Hybrid validation function that supports both discriminated union and escape hatch.
 * 
 * @param {unknown} config The configuration object to validate
 * @returns {AlchemyTransportConfig} Validated configuration object
 * @throws {ConnectionConfigError} If configuration is invalid
 */
export function validateAlchemyTransportConfig(config: unknown): AlchemyTransportConfig {
  // Fast path: try discriminated union validation first (covers 95% of cases)
  if (isAlchemyConnectionConfig(config)) {
    return validateAlchemyConnectionConfig(config);
  }
  
  // Fallback: validate escape hatch pattern
  if (isEscapeHatchConfig(config)) {
    return config as AlchemyConnectionConfigEscapeHatch;
  }
  
  // Neither pattern matched - throw error
  throw new ConnectionConfigError('Configuration does not match any supported format (discriminated union or escape hatch)');
}

/**
 * Type guard to check if a value is a valid Alchemy transport config (including escape hatch).
 * 
 * @param {unknown} value The value to check for validity
 * @returns {boolean} True if the value is a valid Alchemy transport config, false otherwise
 */
export function isAlchemyTransportConfig(value: unknown): value is AlchemyTransportConfig {
  return isAlchemyConnectionConfig(value) || isEscapeHatchConfig(value);
}


// Helper factory functions for common configurations (optional convenience API)

/**
 * Create an API key-based connection configuration.
 * 
 * @param {string} apiKey The Alchemy API key for authentication
 * @param {object} [options] Optional configuration options
 * @param {string} [options.chainAgnosticUrl] Optional chain agnostic URL
 * @returns {AlchemyConnectionConfig} A validated API key-based connection configuration
 */
export function createApiKeyConfig(apiKey: string, options?: { chainAgnosticUrl?: string }): AlchemyConnectionConfig {
  return validateAlchemyConnectionConfig({
    type: 'apiKey',
    apiKey,
    ...options,
  });
}

/**
 * Create a JWT-based connection configuration.
 * 
 * @param {string} jwt The JWT token for authentication
 * @param {object} [options] Optional configuration options
 * @param {string} [options.chainAgnosticUrl] Optional chain agnostic URL
 * @returns {AlchemyConnectionConfig} A validated JWT-based connection configuration
 */
export function createJwtConfig(jwt: string, options?: { chainAgnosticUrl?: string }): AlchemyConnectionConfig {
  return validateAlchemyConnectionConfig({
    type: 'jwt',
    jwt,
    ...options,
  });
}

/**
 * Create an RPC URL-based connection configuration.
 * 
 * @param {string} rpcUrl The custom RPC URL to connect to
 * @param {object} [options] Optional configuration options
 * @param {string} [options.chainAgnosticUrl] Optional chain agnostic URL
 * @returns {AlchemyConnectionConfig} A validated RPC URL-based connection configuration
 */
export function createRpcUrlConfig(rpcUrl: string, options?: { chainAgnosticUrl?: string }): AlchemyConnectionConfig {
  return validateAlchemyConnectionConfig({
    type: 'rpcUrl',
    rpcUrl,
    ...options,
  });
}

