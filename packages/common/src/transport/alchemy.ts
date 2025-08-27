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
import { FetchError } from "../errors/FetchError.js";
import { ServerError } from "../errors/ServerError.js";
import { mutateRemoveTrackingHeaders } from "../tracing/updateHeaders.js";
import { VERSION } from "../version.js";
import type { HttpRequestFn, HttpRequestSchema } from "./types.js";
import { ChainNotFoundError } from "../errors/ChainNotFoundError.js";
import { getAlchemyRpcUrl } from "./chainRegistry.js";

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

type AlchemyTransportBase<
  rpcSchema extends RpcSchema | undefined = undefined,
  httpSchema extends HttpRequestSchema | undefined = undefined,
> = Transport<
  "alchemyHttp",
  {
    alchemyRpcUrl: string;
    fetchOptions: AlchemyTransportConfig["fetchOptions"];
    config: AlchemyTransportConfig;
    makeHttpRequest: HttpRequestFn<httpSchema>;
  },
  EIP1193RequestFn<rpcSchema>
>;

export type AlchemyTransport<
  rpcSchema extends RpcSchema | undefined = undefined,
  httpSchema extends HttpRequestSchema | undefined = undefined,
> = AlchemyTransportBase<rpcSchema, httpSchema> & {
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
  transport: Transport,
  chain: Chain,
): transport is AlchemyTransport {
  return transport({ chain }).config.type === "alchemyHttp";
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
  httpSchema extends HttpRequestSchema | undefined = undefined,
>(config: AlchemyTransportConfig): AlchemyTransport<rpcSchema, httpSchema> {
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

  const headersAsObject = convertHeadersToObject(fetchOptions.headers);

  fetchOptions.headers = {
    ...headersAsObject,
    "Alchemy-AA-Sdk-Version": VERSION,
  };

  // Add auth headers if apiKey or jwt is provided
  if (jwt) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      Authorization: `Bearer ${jwt}`,
    };
  } else if (apiKey) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      Authorization: `Bearer ${apiKey}`,
    };
  }

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
        async makeHttpRequest(params) {
          const response = await fetch(`${rpcUrl}/${params.route}`, {
            method: params.method,
            body: params.body ? JSON.stringify(params.body) : undefined,
            headers: fetchOptions.headers as HeadersInit,
          }).catch((error) => ({
            error: new FetchError(params.route, params.method, error),
          }));

          if ("error" in response) {
            return { error: response.error satisfies BaseError } as any;
          }

          if (!response.ok) {
            return {
              error: new ServerError(
                await response.text(),
                response.status,
                new Error(response.statusText),
              ) satisfies BaseError,
            };
          }

          return { result: await response.json() };
        },
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

export const convertHeadersToObject = (
  headers?: HeadersInit,
): Record<string, string> => {
  if (!headers) {
    return {};
  }

  if (headers instanceof Headers) {
    const headersObject = {} as Record<string, string>;
    headers.forEach((value, key) => {
      headersObject[key] = value;
    });
    return headersObject;
  }

  if (Array.isArray(headers)) {
    return headers.reduce(
      (acc, header) => {
        acc[header[0]] = header[1];
        return acc;
      },
      {} as Record<string, string>,
    );
  }

  return headers;
};
