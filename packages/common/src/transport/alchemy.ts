import {
  createTransport,
  http,
  type Chain,
  type EIP1193RequestFn,
  type HttpTransportConfig,
  type NoUndefined,
  type RpcSchema,
  type Transport,
  type TransportConfig,
} from "viem";
import { BaseError } from "../errors/BaseError.js";
import { FetchError } from "../errors/FetchError.js";
import { ServerError } from "../errors/ServerError.js";
import { mutateRemoveTrackingHeaders } from "../tracing/updateHeaders.js";
import { VERSION } from "../version.js";
import type { HttpRequestFn, HttpRequestSchema } from "./types.js";
import { ChainNotFoundError } from "../errors/ChainNotFoundError.js";

/**
 * Configuration options for the Alchemy transport.
 * Accepts one of three authentication methods: API key, JWT token, or direct URL.
 */
export type AlchemyTransportConfig = (
  | { apiKey: string }
  | { jwt: string }
  | { url: string }
) & {
  /** The max number of times to retry. */
  retryCount?: TransportConfig["retryCount"] | undefined;
  /** The base delay (in ms) between retries. */
  retryDelay?: TransportConfig["retryDelay"] | undefined;
  fetchOptions?: NoUndefined<HttpTransportConfig["fetchOptions"]>;
};

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
 * @param {AlchemyTransportConfig} config - The configuration object for the Alchemy transport
 * @param {string} [config.apiKey] - API key for Alchemy authentication
 * @param {string} [config.jwt] - JWT token for authentication
 * @param {string} [config.url] - Direct URL to Alchemy endpoint
 * @param {number} [config.retryDelay] - The delay between retries, in milliseconds
 * @param {number} [config.retryCount] - The number of retry attempts (default: 0)
 * @param {object} [config.fetchOptions] - Optional fetch options for HTTP requests
 * @returns {AlchemyTransport} The configured Alchemy transport function
 */
export function alchemyTransport<
  rpcSchema extends RpcSchema | undefined = undefined,
  httpSchema extends HttpRequestSchema | undefined = undefined,
>(config: AlchemyTransportConfig): AlchemyTransport<rpcSchema, httpSchema> {
  const {
    retryDelay,
    retryCount = 0,
    fetchOptions: fetchOptions_,
    ...connectionConfig
  } = config;

  // Create a copy of fetch options for modification
  const fetchOptions = { ...fetchOptions_ };

  const headersAsObject = convertHeadersToObject(fetchOptions.headers);

  fetchOptions.headers = {
    ...headersAsObject,
    "Alchemy-AA-Sdk-Version": VERSION,
  };

  if ("jwt" in connectionConfig) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      Authorization: `Bearer ${connectionConfig.jwt}`,
    };
  } else if ("apiKey" in connectionConfig) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      Authorization: `Bearer ${connectionConfig.apiKey}`,
    };
  }

  const transport: AlchemyTransportBase = (opts) => {
    const { chain } = opts;

    mutateRemoveTrackingHeaders(config?.fetchOptions?.headers);

    const rpcUrl = (() => {
      if ("url" in connectionConfig) {
        return connectionConfig.url;
      }

      if (!chain) {
        throw new ChainNotFoundError();
      }

      // TODO(v5): Add support for viem URLs to replace alchemy chains
      if (!chain.rpcUrls?.alchemy?.http?.[0]) {
        throw new BaseError(
          "Chain must include an Alchemy RPC URL. See `defineAlchemyChain` or import a chain from `@alchemy/common`.",
        );
      }

      return chain.rpcUrls.alchemy.http[0];
    })();

    const innerTransport = http(rpcUrl, {
      fetchOptions,
      retryCount,
      retryDelay,
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
