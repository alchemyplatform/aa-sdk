import { z } from "zod";
import { ConnectionConfigError } from "../errors/ConnectionConfigError.js";

/**
 * Alchemy Connection Configuration Schema
 *
 * Provides three authentication options for connecting to Alchemy services:
 *
 * 1. **API Key**: Authenticate using your Alchemy API key
 * 2. **JWT**: Authenticate using a JWT token
 * 3. **URL**: Connect directly using a full RPC URL
 *
 * @example
 * Using API Key:
 * ```ts
 * { apiKey: 'abc123' }
 * ```
 *
 * @example
 * Using JWT:
 * ```ts
 * { jwt: 'eyJhbGc...' }
 * ```
 *
 * @example
 * Using direct URL:
 * ```ts
 * { url: 'https://eth-mainnet.g.alchemy.com/v2/your-key' }
 * ```
 */

/**
 * Main connection configuration using exclusive union.
 * Only one authentication method can be specified at a time.
 */
const ApiKeyConfigSchema = z
  .object({
    apiKey: z.string().min(1, "API key cannot be empty"),
  })
  .strict();

const JwtConfigSchema = z
  .object({
    jwt: z.string().min(1, "JWT cannot be empty"),
  })
  .strict();

const UrlConfigSchema = z
  .object({
    url: z.string().url("Invalid URL format"),
  })
  .strict();

export const AlchemyConnectionConfigSchema = z.union([
  ApiKeyConfigSchema,
  JwtConfigSchema,
  UrlConfigSchema,
]);

/**
 * TypeScript type derived from the schema for external consumption.
 * This provides clean type inference without exposing Zod implementation details.
 */
export type AlchemyConnectionConfig = z.infer<
  typeof AlchemyConnectionConfigSchema
>;

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
export function validateAlchemyConnectionConfig(
  config: unknown,
): AlchemyConnectionConfig {
  const result = AlchemyConnectionConfigSchema.safeParse(config);

  if (!result.success) {
    const firstError = result.error.issues[0];
    const details = firstError?.message || "Invalid connection configuration";
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
 * const maybeConfig: unknown = { apiKey: 'test' };
 * if (isAlchemyConnectionConfig(maybeConfig)) {
 *   // TypeScript knows maybeConfig is AlchemyConnectionConfig here
 *   if ('apiKey' in maybeConfig) {
 *     console.log(maybeConfig.apiKey);
 *   }
 * }
 * ```
 */
export function isAlchemyConnectionConfig(
  value: unknown,
): value is AlchemyConnectionConfig {
  return AlchemyConnectionConfigSchema.safeParse(value).success;
}
