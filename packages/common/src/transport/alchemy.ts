import {
  createTransport,
  http,
  type Chain,
  type EIP1193RequestFn,
  type HttpTransportConfig,
  type RpcSchema,
  type Transport,
} from "viem";
import { BaseError } from "../errors/BaseError.js";
import { mutateRemoveTrackingHeaders } from "../tracing/updateHeaders.js";
import { ChainNotFoundError } from "../errors/ChainNotFoundError.js";
import { getAlchemyRpcUrl } from "./chainRegistry.js";
import {
  convertHeadersToObject,
  withAlchemyHeaders,
} from "../utils/headers.js";

/**
 * Configuration options for the Alchemy transport.
 * Extends viem's HttpTransportConfig with Alchemy-specific options while omitting
 * options that are not relevant or supported by Alchemy.
 */
export interface AlchemyTransportConfig
  extends Omit<
    HttpTransportConfig,
    "batch" | "key" | "methods" | "name" | "raw"
  > {
  /** API key for Alchemy authentication */
  apiKey?: string;
  /** JWT token for authentication */
  jwt?: string;
  /** Custom RPC URL (optional - defaults to chain's Alchemy URL, but can be used to override the chain's Alchemy URL) */
  url?: string;
}

type AlchemyTransportBase<rpcSchema extends RpcSchema | undefined = undefined> =
  Transport<
    "alchemyHttp",
    {
      alchemyRpcUrl: string;
      fetchOptions: AlchemyTransportConfig["fetchOptions"];
      config: AlchemyTransportConfig;
    },
    EIP1193RequestFn<rpcSchema>
  >;

export type AlchemyTransport<
  rpcSchema extends RpcSchema | undefined = undefined,
> = AlchemyTransportBase<rpcSchema> & {
  updateHeaders(newHeaders: HeadersInit): void;
};

/**
 * A type guard for the transport to determine if it is an Alchemy transport.
 * Used in cases where we would like to do switching depending on the transport.
 *
 * @param {Transport} transport The transport to check
 * @param {Chain} chain Chain for the transport to run its function to return the transport config
 * @returns {boolean} `true` if the transport is an Alchemy transport, otherwise `false`
 */
export function isAlchemyTransport(
  transport: unknown,
  chain: Chain | undefined,
): transport is AlchemyTransport {
  try {
    if (!chain) return false;
    return (transport as any)({ chain }).config.type === "alchemyHttp";
  } catch {
    return false;
  }
}

/**
 * Creates an Alchemy HTTP transport for connecting to Alchemy's services.
 *
 * @example
 * Using API Key:
 * ```ts
 * import { alchemyTransport } from "@alchemy/common";
 *
 * const transport = alchemyTransport({ apiKey: "your-api-key" });
 * ```
 *
 * @example
 * Using JWT:
 * ```ts
 * import { alchemyTransport } from "@alchemy/common";
 *
 * const transport = alchemyTransport({ jwt: "your-jwt-token" });
 * ```
 *
 * @example
 * Using URL directly:
 * ```ts
 * import { alchemyTransport } from "@alchemy/common";
 *
 * const transport = alchemyTransport({ url: "https://eth-mainnet.g.alchemy.com/v2/your-key" });
 * ```
 *
 * @example
 * Using custom URL with API key:
 * ```ts
 * import { alchemyTransport } from "@alchemy/common";
 *
 * const transport = alchemyTransport({
 *   url: "https://custom-alchemy.com/v2",
 *   apiKey: "your-api-key"
 * });
 * ```
 *
 * @example
 * Using custom URL with JWT:
 * ```ts
 * import { alchemyTransport } from "@alchemy/common";
 *
 * const transport = alchemyTransport({
 *   url: "https://custom-alchemy.com/v2",
 *   jwt: "your-jwt-token"
 * });
 * ```
 *
 * @example
 * Using HTTP debugging options:
 * ```ts
 * import { alchemyTransport } from "@alchemy/common";
 *
 * const transport = alchemyTransport({
 *   apiKey: "your-api-key",
 *   onFetchRequest: (request) => console.log("Request:", request),
 *   onFetchResponse: (response) => console.log("Response:", response),
 *   timeout: 30000,
 *   retryCount: 3,
 *   retryDelay: 1000
 * });
 * ```
 *
 * @param {AlchemyTransportConfig} config - The configuration object for the Alchemy transport (extends viem's HttpTransportConfig)
 * @param {string} [config.apiKey] - API key for Alchemy authentication
 * @param {string} [config.jwt] - JWT token for authentication
 * @param {string} [config.url] - Direct URL to Alchemy endpoint or a proxy URL
 * @param {Function} [config.onFetchRequest] - Callback for debugging outgoing requests
 * @param {Function} [config.onFetchResponse] - Callback for debugging responses
 * @param {number} [config.timeout] - Request timeout in milliseconds
 * @param {number} [config.retryCount] - The number of retry attempts
 * @param {number} [config.retryDelay] - The delay between retries, in milliseconds
 * @param {object} [config.fetchOptions] - Optional fetch options for HTTP requests
 * @param {object} [config.httpOptions] - HTTP transport options for debugging (onFetchRequest, onFetchResponse, timeout, batch)
 * @returns {AlchemyTransport} The configured Alchemy transport function
 */
export function alchemyTransport<
  rpcSchema extends RpcSchema | undefined = undefined,
>(config: AlchemyTransportConfig): AlchemyTransport<rpcSchema> {
  const {
    apiKey,
    jwt,
    url,
    fetchOptions: fetchOptions_,
    retryCount,
    retryDelay,
    ...httpTransportConfig
  } = config;

  // Create a copy of fetch options for modification
  const fetchOptions = { ...fetchOptions_ };

  fetchOptions.headers = withAlchemyHeaders({
    headers: fetchOptions.headers,
    apiKey,
    jwt,
  });

  const transport: AlchemyTransportBase = (opts) => {
    const { chain } = opts;

    mutateRemoveTrackingHeaders(config?.fetchOptions?.headers);

    const rpcUrl = (() => {
      if (url) {
        return url;
      }

      if (!chain) {
        throw new ChainNotFoundError();
      }

      const alchemyUrl = getAlchemyRpcUrl(chain.id);
      if (alchemyUrl) {
        return alchemyUrl;
      }

      // Fallback: check for legacy alchemy RPC URLs in chain definition
      if (chain.rpcUrls?.alchemy?.http?.[0]) {
        return chain.rpcUrls.alchemy.http[0];
      }

      throw new BaseError(
        `Chain ${chain.id} (${chain.name}) is not supported by Alchemy. To use this chain:\n\n` +
          `1. Use a direct RPC URL:\n` +
          `   alchemyTransport({ url: "https://your-alchemy-endpoint.com/v2/your-key" })\n\n` +
          `2. Add alchemy RPC to your chain definition:\n` +
          `   defineChain({ rpcUrls: { alchemy: { http: ["https://your-alchemy-url/v2"] }}})\n\n` +
          `3. Or use a standard RPC provider:\n` +
          `   import { http } from "viem";\n` +
          `   http("https://your-standard-rpc.com")`,
      );
    })();

    const innerTransport = http(rpcUrl, {
      // Standard viem options are passed through to the underlying transport, with
      // the exception of retryCount and retryDelay because those are handled by
      // the outer Alchemy transport.
      ...httpTransportConfig,
      fetchOptions,
      // Retry count must be 0 here in order to respect the retry
      // count that is already specified on the underlying transport.
      retryCount: 0,
    });

    return createTransport(
      {
        key: "alchemyHttp",
        name: "Alchemy HTTP Transport",
        request: innerTransport(opts).request,
        retryCount: retryCount ?? opts?.retryCount,
        retryDelay,
        type: "alchemyHttp",
      },
      {
        alchemyRpcUrl: rpcUrl,
        fetchOptions,
        config,
      },
    );
  };

  return Object.assign(transport, {
    updateHeaders(newHeaders_: HeadersInit) {
      const newHeaders = convertHeadersToObject(newHeaders_);

      fetchOptions.headers = {
        ...fetchOptions.headers,
        ...newHeaders,
      };
    },
  });
}
