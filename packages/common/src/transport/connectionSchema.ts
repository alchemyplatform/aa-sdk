import { z } from "zod";
import { ConnectionConfigError } from "../errors/ConnectionConfigError.js";

/**
 * V5 Connection Configuration Schema using simplified discriminated unions.
 * 
 * This schema provides a clean API for configuring Alchemy connections with just two concepts:
 * 1. **Connection mode**: How to connect to Alchemy (apiKey, jwt, or proxy)
 * 2. **Node RPC URL**: Optional third-party RPC for chains without Alchemy node support
 * 
 * The presence of `nodeRpcUrl` naturally indicates whether this is an AA-only chain,
 * eliminating the need for complex nested configurations or separate type discriminators.
 * 
 * @example
 * Standard chain with Alchemy node RPC:
 * ```ts
 * { mode: 'apiKey', apiKey: 'abc123' }
 * ```
 * 
 * @example
 * AA-only chain (e.g., Zora) with third-party node RPC:
 * ```ts
 * { mode: 'apiKey', apiKey: 'abc123', nodeRpcUrl: 'https://zora.rpc.com' }
 * ```
 * 
 * @example
 * Proxy all traffic through backend:
 * ```ts
 * { mode: 'proxy', proxyUrl: 'https://my-backend.com/api' }
 * ```
 */

/**
 * Main connection configuration with discriminated union on 'mode' field.
 * Each connection mode has its own specific fields, with optional nodeRpcUrl for all.
 */
export const AlchemyConnectionConfigSchema = z.discriminatedUnion('mode', [
  // API Key authentication
  z.object({
    mode: z.literal('apiKey'),
    apiKey: z.string().min(1, 'API key cannot be empty'),
    nodeRpcUrl: z.string().url('Invalid node RPC URL format').optional(),
    chainAgnosticUrl: z.string().url('Invalid chain agnostic URL format').optional(),
  }),
  // JWT authentication
  z.object({
    mode: z.literal('jwt'),
    jwt: z.string().min(1, 'JWT cannot be empty'),
    nodeRpcUrl: z.string().url('Invalid node RPC URL format').optional(),
    chainAgnosticUrl: z.string().url('Invalid chain agnostic URL format').optional(),
  }),
  // Proxy mode (routes all traffic through custom endpoint)
  z.object({
    mode: z.literal('proxy'),
    proxyUrl: z.string().url('Invalid proxy URL format'),
    nodeRpcUrl: z.string().url('Invalid node RPC URL format').optional(),
    // Note: chainAgnosticUrl intentionally omitted for proxy - everything goes through proxyUrl
  }),
]);

/**
 * TypeScript type derived from the schema for external consumption.
 * This provides clean type inference without exposing Zod implementation details.
 */
export type AlchemyConnectionConfig = z.infer<typeof AlchemyConnectionConfigSchema>;

/**
 * Validates an Alchemy connection configuration object.
 * 
 * @param {unknown} config - The configuration object to validate
 * @returns {AlchemyConnectionConfig} The validated configuration object
 * @throws {ConnectionConfigError} If the configuration is invalid
 * 
 * @example
 * ```ts
 * try {
 *   const config = validateAlchemyConnectionConfig({
 *     mode: 'apiKey',
 *     apiKey: 'your-api-key'
 *   });
 *   // config is now typed as AlchemyConnectionConfig
 * } catch (error) {
 *   if (error instanceof ConnectionConfigError) {
 *     console.error('Invalid config:', error.message);
 *   }
 * }
 * ```
 */
export function validateAlchemyConnectionConfig(config: unknown): AlchemyConnectionConfig {
  const result = AlchemyConnectionConfigSchema.safeParse(config);
  
  if (!result.success) {
    const firstError = result.error.issues[0];
    const details = firstError?.message || 'Invalid connection configuration';
    throw new ConnectionConfigError(details);
  }
  
  return result.data;
}

/**
 * Type guard to check if a value is a valid Alchemy connection config.
 * 
 * @param {unknown} value - The value to check for validity
 * @returns {boolean} True if the value is a valid Alchemy connection config
 * 
 * @example
 * ```ts
 * const maybeConfig: unknown = { mode: 'apiKey', apiKey: 'test' };
 * if (isAlchemyConnectionConfig(maybeConfig)) {
 *   // TypeScript knows maybeConfig is AlchemyConnectionConfig here
 *   console.log(maybeConfig.mode); // 'apiKey'
 * }
 * ```
 */
export function isAlchemyConnectionConfig(value: unknown): value is AlchemyConnectionConfig {
  return AlchemyConnectionConfigSchema.safeParse(value).success;
}

// Helper factory functions for common configurations

/**
 * Creates an API key-based connection configuration.
 * 
 * @param {string} apiKey - The Alchemy API key for authentication
 * @param {object} [options] - Optional configuration options
 * @param {string} [options.nodeRpcUrl] - Third-party node RPC URL for AA-only chains
 * @param {string} [options.chainAgnosticUrl] - Optional chain agnostic URL override
 * @returns {AlchemyConnectionConfig} A validated API key-based connection configuration
 * 
 * @example
 * ```ts
 * // Standard chain
 * const config = createApiKeyConfig('your-api-key');
 * 
 * // AA-only chain with third-party RPC
 * const aaConfig = createApiKeyConfig('your-api-key', {
 *   nodeRpcUrl: 'https://zora.rpc.com'
 * });
 * ```
 */
export function createApiKeyConfig(
  apiKey: string, 
  options?: { 
    nodeRpcUrl?: string;
    chainAgnosticUrl?: string;
  }
): AlchemyConnectionConfig {
  return validateAlchemyConnectionConfig({
    mode: 'apiKey',
    apiKey,
    ...options,
  });
}

/**
 * Creates a JWT-based connection configuration.
 * 
 * @param {string} jwt - The JWT token for authentication
 * @param {object} [options] - Optional configuration options
 * @param {string} [options.nodeRpcUrl] - Third-party node RPC URL for AA-only chains
 * @param {string} [options.chainAgnosticUrl] - Optional chain agnostic URL override
 * @returns {AlchemyConnectionConfig} A validated JWT-based connection configuration
 * 
 * @example
 * ```ts
 * // Standard chain
 * const config = createJwtConfig('your-jwt-token');
 * 
 * // AA-only chain with third-party RPC
 * const aaConfig = createJwtConfig('your-jwt-token', {
 *   nodeRpcUrl: 'https://base.rpc.com'
 * });
 * ```
 */
export function createJwtConfig(
  jwt: string,
  options?: {
    nodeRpcUrl?: string;
    chainAgnosticUrl?: string;
  }
): AlchemyConnectionConfig {
  return validateAlchemyConnectionConfig({
    mode: 'jwt',
    jwt,
    ...options,
  });
}

/**
 * Creates a proxy-based connection configuration that routes all traffic through a custom endpoint.
 * 
 * @param {string} proxyUrl - The proxy URL for routing all traffic
 * @param {object} [options] - Optional configuration options
 * @param {string} [options.nodeRpcUrl] - Third-party node RPC URL for AA-only chains
 * @returns {AlchemyConnectionConfig} A validated proxy-based connection configuration
 * 
 * @example
 * ```ts
 * // Route everything through proxy
 * const config = createProxyConfig('https://my-backend.com/api');
 * 
 * // AA-only chain: third-party RPC for node, proxy for AA
 * const aaConfig = createProxyConfig('https://my-backend.com/api', {
 *   nodeRpcUrl: 'https://zora.rpc.com'
 * });
 * ```
 */
export function createProxyConfig(
  proxyUrl: string,
  options?: {
    nodeRpcUrl?: string;
  }
): AlchemyConnectionConfig {
  return validateAlchemyConnectionConfig({
    mode: 'proxy',
    proxyUrl,
    ...options,
  });
}

/**
 * @deprecated Use createProxyConfig instead. This function will be removed in the next major version.
 * @param {string} proxyUrl - The proxy URL
 * @param {object} [_options] - Unused options (for backward compatibility)
 * @param {string} [_options.chainAgnosticUrl] - Unused chain agnostic URL
 * @returns {AlchemyConnectionConfig} A proxy configuration
 */
export function createProxyUrlConfig(proxyUrl: string, _options?: { chainAgnosticUrl?: string }): AlchemyConnectionConfig {
  return createProxyConfig(proxyUrl);
}

/**
 * @deprecated Use createProxyConfig instead. This function will be removed in the next major version.
 * @param {string} rpcUrl - The RPC URL (treated as proxy URL)
 * @param {object} [_options] - Unused options (for backward compatibility)
 * @param {string} [_options.chainAgnosticUrl] - Unused chain agnostic URL
 * @returns {AlchemyConnectionConfig} A proxy configuration
 */
export function createRpcUrlConfig(rpcUrl: string, _options?: { chainAgnosticUrl?: string }): AlchemyConnectionConfig {
  return createProxyConfig(rpcUrl);
}