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
import { ChainNotFoundError } from "../errors/ChainNotFoundError.js";
import { FetchError } from "../errors/FetchError.js";
import { ServerError } from "../errors/ServerError.js";
import { mutateRemoveTrackingHeaders } from "../tracing/updateHeaders.js";
import { VERSION } from "../version.js";
import { type AlchemyConnectionConfig, validateAlchemyConnectionConfig } from "./connectionSchema.js";
import { split } from "./split.js";
import type { HttpRequestFn, HttpRequestSchema } from "./types.js";

const alchemyMethods = [
  "eth_sendUserOperation",
  "eth_estimateUserOperationGas",
  "eth_getUserOperationReceipt",
  "eth_getUserOperationByHash",
  "eth_supportedEntryPoints",
  "rundler_maxPriorityFeePerGas",
  "pm_getPaymasterData",
  "pm_getPaymasterStubData",
  "alchemy_requestGasAndPaymasterAndData",
];

const chainAgnosticMethods = [
  "wallet_prepareCalls",
  "wallet_sendPreparedCalls",
  "wallet_requestAccount",
  "wallet_createAccount",
  "wallet_listAccounts",
  "wallet_createSession",
  "wallet_getCallsStatus",
];

const DEFAULT_CHAIN_AGNOSTIC_URL = "https://api.g.alchemy.com/v2";

export type AlchemyTransportConfig = AlchemyConnectionConfig & {
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
  "alchemy",
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
 * Used in cases where we would like to do switching depending on the transport, where there used
 * to be two clients for a alchemy and a non alchemy, and with this switch we don't need the two seperate clients.
 *
 * @param {Transport} transport The transport to check
 * @param {Chain} chain Chain for the transport to run its function to return the transport config
 * @returns {boolean} `true` if the transport is an Alchemy transport, otherwise `false`
 */
export function isAlchemyTransport(
  transport: Transport,
  chain: Chain,
): transport is AlchemyTransport {
  return transport({ chain }).config.type === "alchemy";
}

/**
 * Creates an Alchemy transport with the specified configuration using a simplified schema.
 * 
 * The transport automatically handles routing based on two key factors:
 * 1. **Connection mode** (`mode`): How to connect to Alchemy services (apiKey, jwt, or proxy)
 * 2. **Node RPC URL** (`nodeRpcUrl`): Whether to use third-party RPC for blockchain operations
 * 
 * @example
 * ### Standard Chain (Alchemy has node RPC support)
 * ```ts
 * import { alchemy, createApiKeyConfig } from "@alchemy/common";
 * 
 * // Using factory function (recommended)
 * const transport = alchemy(createApiKeyConfig("your-api-key"));
 * 
 * // Or direct configuration
 * const transport = alchemy({
 *   mode: "apiKey",
 *   apiKey: "your-api-key"
 * });
 * ```
 * 
 * ### AA-Only Chain (no Alchemy node RPC)
 * ```ts
 * import { alchemy, createApiKeyConfig } from "@alchemy/common";
 * 
 * // Third-party RPC for blockchain operations, Alchemy for AA
 * const transport = alchemy(createApiKeyConfig("your-api-key", {
 *   nodeRpcUrl: "https://zora-node.com/rpc"
 * }));
 * 
 * // Or direct configuration
 * const transport = alchemy({
 *   mode: "apiKey",
 *   apiKey: "your-api-key",
 *   nodeRpcUrl: "https://zora-node.com/rpc"
 * });
 * ```
 * 
 * ### Proxy Configuration
 * ```ts
 * import { alchemy, createProxyConfig } from "@alchemy/common";
 * 
 * // Route everything through your backend
 * const transport = alchemy(createProxyConfig("https://my-backend.com/api"));
 * ```
 * 
 * @param {AlchemyTransportConfig} config - The configuration object for the Alchemy transport
 * @param {number} [config.retryDelay] - The delay between retries, in milliseconds
 * @param {number} [config.retryCount] - The number of retry attempts
 * @param {object} [config.fetchOptions] - Optional fetch options for HTTP requests
 * @param {"apiKey" | "jwt" | "proxy"} config.mode - The connection mode to use
 * @param {string} [config.apiKey] - API key for Alchemy (required when mode is "apiKey")
 * @param {string} [config.jwt] - JWT token for authentication (required when mode is "jwt")
 * @param {string} [config.proxyUrl] - Proxy URL for routing traffic (required when mode is "proxy")
 * @param {string} [config.nodeRpcUrl] - Third-party node RPC URL for AA-only chains (optional)
 * @param {string} [config.chainAgnosticUrl] - Optional chain-agnostic URL override (not available for proxy)
 * @returns {AlchemyTransport} The configured Alchemy transport function
 */
export function alchemy<
  rpcSchema extends RpcSchema | undefined = undefined,
  httpSchema extends HttpRequestSchema | undefined = undefined,
>(config: AlchemyTransportConfig): AlchemyTransport<rpcSchema, httpSchema> {
  const {
    retryDelay,
    retryCount = 0,
    fetchOptions: fetchOptions_,
    ...connectionConfig
  } = config;
  
  // Validate the connection configuration at runtime
  const validatedConfig = validateAlchemyConnectionConfig(connectionConfig);
  
  // Create a copy of fetch options for modification
  // We don't want to add Alchemy headers to 3rd party nodes
  const fetchOptions = { ...fetchOptions_ };

  const headersAsObject = convertHeadersToObject(fetchOptions.headers);

  fetchOptions.headers = {
    ...headersAsObject,
    "Alchemy-AA-Sdk-Version": VERSION,
  };

  // Set up authentication headers based on connection mode
  if (validatedConfig.mode === 'jwt') {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      Authorization: `Bearer ${validatedConfig.jwt}`,
    };
  } else if (validatedConfig.mode === 'apiKey') {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      Authorization: `Bearer ${validatedConfig.apiKey}`,
    };
  }
  // Note: No auth headers for proxy mode - backend handles authentication

  const transport: AlchemyTransportBase = (opts) => {
    const { chain } = opts;
    if (!chain) {
      throw new ChainNotFoundError();
    }

    const { innerTransport, rpcUrl } = (() => {
      mutateRemoveTrackingHeaders(config?.fetchOptions?.headers);
      
      const hasThirdPartyRpc = !!validatedConfig.nodeRpcUrl;
      const isProxy = validatedConfig.mode === 'proxy';
      
      if (isProxy) {
        // Proxy mode: route everything through the proxy URL
        const proxyUrl = validatedConfig.proxyUrl;
        
        if (hasThirdPartyRpc) {
          // AA-only chain with proxy: split between third-party RPC and proxy for AA
          return {
            rpcUrl: proxyUrl,
            innerTransport: split({
              overrides: [
                {
                  methods: alchemyMethods,
                  transport: http(proxyUrl, {
                    fetchOptions,
                    retryCount,
                    retryDelay,
                  }),
                },
                {
                  methods: chainAgnosticMethods,
                  transport: http(proxyUrl, {
                    fetchOptions,
                    retryCount,
                    retryDelay,
                  }),
                },
              ],
              fallback: http(validatedConfig.nodeRpcUrl, {
                fetchOptions: fetchOptions_, // Original options without Alchemy headers
                retryCount,
                retryDelay,
              }),
            }),
          };
        } else {
          // Standard chain with proxy: everything through proxy
          return {
            rpcUrl: proxyUrl,
            innerTransport: http(proxyUrl, {
              fetchOptions,
              retryCount,
              retryDelay,
            }),
          };
        }
      }
      
      // Non-proxy modes (apiKey or jwt)
      if (hasThirdPartyRpc) {
        // AA-only chain: use third-party RPC for blockchain ops, Alchemy for AA
        const chainAgnosticUrl = validatedConfig.chainAgnosticUrl ?? DEFAULT_CHAIN_AGNOSTIC_URL;
        
        return {
          rpcUrl: chainAgnosticUrl,
          innerTransport: split({
            overrides: [
              {
                methods: alchemyMethods,
                transport: http(chainAgnosticUrl, {
                  fetchOptions,
                  retryCount,
                  retryDelay,
                }),
              },
              {
                methods: chainAgnosticMethods,
                transport: http(chainAgnosticUrl, {
                  fetchOptions,
                  retryCount,
                  retryDelay,
                }),
              },
            ],
            fallback: http(validatedConfig.nodeRpcUrl, {
              fetchOptions: fetchOptions_, // Original options without Alchemy headers
              retryCount,
              retryDelay,
            }),
          }),
        };
      }
      
      // Standard chain with direct Alchemy connection
      if (chain.rpcUrls.alchemy == null) {
        throw new BaseError(
          "chain must include an alchemy rpc url. See `defineAlchemyChain` or import a chain from `@alchemy/common/chains`.",
        );
      }
      
      const alchemyRpcUrl = chain.rpcUrls.alchemy.http[0];
      const chainAgnosticUrl = validatedConfig.chainAgnosticUrl ?? DEFAULT_CHAIN_AGNOSTIC_URL;
      
      return {
        rpcUrl: alchemyRpcUrl,
        innerTransport: split({
          overrides: [
            {
              methods: chainAgnosticMethods,
              transport: http(chainAgnosticUrl, {
                fetchOptions,
                retryCount,
                retryDelay,
              }),
            },
          ],
          fallback: http(alchemyRpcUrl, {
            fetchOptions,
            retryCount,
            retryDelay,
          }),
        }),
      };
    })();

    return createTransport(
      {
        key: "alchemy",
        name: "Alchemy Transport",
        request: innerTransport(opts).request,
        retryCount: retryCount ?? opts?.retryCount,
        retryDelay,
        type: "alchemy",
      },
      {
        alchemyRpcUrl: rpcUrl,
        fetchOptions,
        config,
        async makeHttpRequest(params) {
          const response = await fetch(`${rpcUrl}/${params.route}`, {
            method: params.method,
            body: params.body ? JSON.stringify(params.body) : undefined,
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