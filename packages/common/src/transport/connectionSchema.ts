import { z } from "zod";
import { ConnectionConfigError } from "../errors/ConnectionConfigError.js";

/**
 * V5 Connection Configuration Schema using discriminated unions. 
 */

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

/**
 * Create a proxy URL-based connection configuration.
 * 
 * @param {string} proxyUrl The proxy URL for backend API calls
 * @param {object} [options] Optional configuration options
 * @param {string} [options.chainAgnosticUrl] Optional chain agnostic URL
 * @returns {AlchemyConnectionConfig} A validated proxy URL-based connection configuration
 */
export function createProxyUrlConfig(proxyUrl: string, options?: { chainAgnosticUrl?: string }): AlchemyConnectionConfig {
  return validateAlchemyConnectionConfig({
    type: 'proxyUrl',
    proxyUrl,
    ...options,
  });
}
