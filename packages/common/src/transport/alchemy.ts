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
import { type AlchemyConnectionConfig, validateAlchemyConnectionConfig } from "./connection-schema.js";
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
 * to be two clients for a alchemy and a non alchemy, and with this switch we don't need the two seperate clients. *
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
 * Creates an Alchemy transport with the specified configuration options using discriminated unions.
 * Each configuration type is explicitly defined with a 'type' discriminator for clear validation and type safety.
 *
 * @example
 * ### API Key Configuration
 * Most common setup for Alchemy-supported chains:
 * ```ts twoslash
 * import { alchemy, createApiKeyConfig } from "@alchemy/common";
 *
 * // Using factory function (recommended)
 * const transport = alchemy(createApiKeyConfig("your-api-key"));
 *
 * // Or explicit configuration
 * const transport = alchemy({
 *   type: "apiKey",
 *   apiKey: "your-api-key"
 * });
 * ```
 *
 * ### JWT Configuration
 * For JWT-based authentication:
 * ```ts twoslash
 * import { alchemy, createJwtConfig } from "@alchemy/common";
 *
 * const transport = alchemy(createJwtConfig("your-jwt-token"));
 * ```
 *
 * ### Custom RPC URL
 * For using custom RPC endpoints:
 * ```ts twoslash
 * import { alchemy, createRpcUrlConfig } from "@alchemy/common";
 *
 * const transport = alchemy(createRpcUrlConfig("https://custom-rpc.example.com"));
 * ```
 *
 * ### AA-Only Chain Configuration
 * For chains where Alchemy only supports Account Abstraction (Bundler/Paymaster) but not node RPC:
 * ```ts twoslash
 * import { alchemy } from "@alchemy/common";
 *
 * const transport = alchemy({
 *   type: "aaOnly",
 *   alchemyConnection: {
 *     type: "apiKey",
 *     apiKey: "your-api-key"
 *   },
 *   nodeRpcUrl: "https://node-rpc.example.com"
 * });
 * ```
 *
 * @param {AlchemyTransportConfig} config The configuration object for the Alchemy transport.
 * @param {number} [config.retryDelay] The delay between retries, in milliseconds.
 * @param {number} [config.retryCount] The number of retry attempts.
 * @param {object} [config.fetchOptions] Optional fetch options for HTTP requests.
 * @param {"apiKey" | "jwt" | "rpcUrl" | "aaOnly"} config.type The discriminator specifying the configuration type.
 * @param {string} [config.apiKey] API key for Alchemy (required when type is "apiKey").
 * @param {string} [config.jwt] JWT token for authentication (required when type is "jwt").
 * @param {string} [config.rpcUrl] Custom RPC URL (required when type is "rpcUrl").
 * @param {object} [config.alchemyConnection] Nested authentication config (required when type is "aaOnly").
 * @param {string} [config.nodeRpcUrl] External node RPC URL (required when type is "aaOnly").
 * @param {string} [config.chainAgnosticUrl] Optional chain-agnostic URL override for all config types.
 * @returns {AlchemyTransport} The configured Alchemy transport function.
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
  
  // we create a copy here in case we create a split transport down below
  // we don't want to add alchemy headers to 3rd party nodes
  const fetchOptions = { ...fetchOptions_ };

  const headersAsObject = convertHeadersToObject(fetchOptions.headers);

  fetchOptions.headers = {
    ...headersAsObject,
    "Alchemy-AA-Sdk-Version": VERSION,
  };

  // Handle authentication based on validated config type
  if (validatedConfig.type === 'jwt') {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      Authorization: `Bearer ${validatedConfig.jwt}`,
    };
  } else if (validatedConfig.type === 'apiKey') {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      Authorization: `Bearer ${validatedConfig.apiKey}`,
    };
  } else if (validatedConfig.type === 'aaOnly') {
    // Handle nested authentication for AA-only config
    const authConfig = validatedConfig.alchemyConnection;
    if (authConfig.type === 'jwt') {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${authConfig.jwt}`,
      };
    } else if (authConfig.type === 'apiKey') {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${authConfig.apiKey}`,
      };
    }
  }

  const transport: AlchemyTransportBase = (opts) => {
    const { chain } = opts;
    if (!chain) {
      throw new ChainNotFoundError();
    }

    const { innerTransport, rpcUrl } = (() => {
      mutateRemoveTrackingHeaders(config?.fetchOptions?.headers);
      
      // Handle each discriminated union case
      switch (validatedConfig.type) {
        case 'aaOnly': {
          // AA-only configuration with split transport
          const chainAgnosticRpcUrl = validatedConfig.chainAgnosticUrl ?? DEFAULT_CHAIN_AGNOSTIC_URL;
          const alchemyRpcUrl = chain.rpcUrls.alchemy?.http[0] ?? chainAgnosticRpcUrl;
          
          return {
            rpcUrl: chainAgnosticRpcUrl,
            innerTransport: split({
              overrides: [
                {
                  methods: alchemyMethods,
                  transport: http(alchemyRpcUrl, {
                    fetchOptions,
                    retryCount,
                    retryDelay,
                  }),
                },
                {
                  methods: chainAgnosticMethods,
                  transport: http(chainAgnosticRpcUrl, {
                    fetchOptions,
                    retryCount,
                    retryDelay,
                  }),
                },
              ],
              fallback: http(validatedConfig.nodeRpcUrl, {
                fetchOptions: fetchOptions_,
                retryCount,
                retryDelay,
              }),
            }),
          };
        }
        

        case 'rpcUrl': {
          // Custom RPC URL configuration
          const rpcUrl = validatedConfig.rpcUrl;
          const chainAgnosticRpcUrl = validatedConfig.chainAgnosticUrl ?? DEFAULT_CHAIN_AGNOSTIC_URL;
          
          return {
            rpcUrl,
            innerTransport: split({
              overrides: [
                {
                  methods: chainAgnosticMethods,
                  transport: http(chainAgnosticRpcUrl, {
                    fetchOptions,
                    retryCount,
                    retryDelay,
                  }),
                },
              ],
              fallback: http(rpcUrl, { fetchOptions, retryCount, retryDelay }),
            }),
          };
        }
        
        case 'apiKey':
        case 'jwt': {
          // Standard Alchemy API configurations
          if (chain.rpcUrls.alchemy == null) {
            throw new BaseError(
              "chain must include an alchemy rpc url. See `defineAlchemyChain` or import a chain from `@alchemy/common/chains`.",
            );
          }
          
          const rpcUrl = chain.rpcUrls.alchemy.http[0];
          const chainAgnosticRpcUrl = validatedConfig.chainAgnosticUrl ?? DEFAULT_CHAIN_AGNOSTIC_URL;
          
          return {
            rpcUrl,
            innerTransport: split({
              overrides: [
                {
                  methods: chainAgnosticMethods,
                  transport: http(chainAgnosticRpcUrl, {
                    fetchOptions,
                    retryCount,
                    retryDelay,
                  }),
                },
              ],
              fallback: http(rpcUrl, { fetchOptions, retryCount, retryDelay }),
            }),
          };
        }
        
        default: {
          // TypeScript exhaustiveness check
          const _exhaustive: never = validatedConfig;
          throw new BaseError(`Unsupported connection type: ${JSON.stringify(_exhaustive)}`);
        }
      }
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
