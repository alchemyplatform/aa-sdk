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
 * Using API Key (uses chain's Alchemy URL):
 * ```ts
 * { apiKey: 'abc123' }
 * ```
 *
 * @example
 * Using JWT (uses chain's Alchemy URL):
 * ```ts
 * { jwt: 'eyJhbGc...' }
 * ```
 *
 * @example
 * Using direct URL only:
 * ```ts
 * { url: 'https://eth-mainnet.g.alchemy.com/v2/your-key' }
 * ```
 *
 * @example
 * Using custom URL with API key:
 * ```ts
 * { url: 'https://custom-alchemy.com/v2', apiKey: 'abc123' }
 * ```
 *
 * @example
 * Using custom URL with JWT:
 * ```ts
 * { url: 'https://custom-alchemy.com/v2', jwt: 'eyJhbGc...' }
 * ```
 */

/**
 * Main connection configuration allowing flexible combinations.
 * Can specify URL, auth method, or both together.
 */
export const AlchemyConnectionConfigSchema = z
  .object({
    /** API key for Alchemy authentication */
    apiKey: z.string().min(1, "API key cannot be empty").optional(),
    /** JWT token for authentication */
    jwt: z.string().min(1, "JWT cannot be empty").optional(),
    /** Custom RPC URL (optional - defaults to chain's Alchemy URL) */
    url: z.string().url("Invalid URL format").optional(),
  })
  .strict()
  .refine(
    (data) => {
      // Must have at least one field
      return data.apiKey || data.jwt || data.url;
    },
    {
      message: "Must specify at least one of: apiKey, jwt, or url",
    },
  )
  .refine(
    (data) => {
      // Cannot have both apiKey and jwt
      return !(data.apiKey && data.jwt);
    },
    {
      message:
        "Cannot specify both apiKey and jwt - choose only one authentication method",
    },
  );

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
 *   if (maybeConfig.apiKey) {
 *     console.log('Using API key:', maybeConfig.apiKey);
 *   }
 *   if (maybeConfig.url) {
 *     console.log('Using custom URL:', maybeConfig.url);
 *   }
 * }
 * ```
 */
export function isAlchemyConnectionConfig(
  value: unknown,
): value is AlchemyConnectionConfig {
  return AlchemyConnectionConfigSchema.safeParse(value).success;
}
