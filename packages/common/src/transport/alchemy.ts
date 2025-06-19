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
import type { AlchemyConnectionConfig } from "./connection.js";
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
  chain: Chain
): transport is AlchemyTransport {
  return transport({ chain }).config.type === "alchemy";
}

/**
 * Creates an Alchemy transport with the specified configuration options.
 * When sending all traffic to Alchemy, you must pass in one of rpcUrl, apiKey, or jwt.
 * If you want to send Bundler and Paymaster traffic to Alchemy and Node traffic to a different RPC, you must pass in alchemyConnection and nodeRpcUrl.
 *
 * @example
 * ### Basic Example
 * If the chain you're using is supported for both Bundler and Node RPCs, then you can do the following:
 * ```ts twoslash
 * import { alchemy } from "@alchemy/common";
 *
 * const transport = alchemy({
 *  // NOTE: you can also pass in an rpcUrl or jwt here or rpcUrl and jwt
 *  apiKey: "your-api-key",
 * });
 * ```
 *
 * ### AA Only Chains
 * For AA-only chains, you need to specify the alchemyConnection and nodeRpcUrl since Alchemy only
 * handles the Bundler and Paymaster RPCs for these chains.
 * ```ts twoslash
 * import { alchemy } from "@alchemy/common";
 *
 * const transport = alchemy({
 *  alchemyConnection: {
 *    apiKey: "your-api-key",
 *  },
 *  nodeRpcUrl: "https://zora.rpc.url",
 * });
 * ```
 *
 * ### Split Transport support
 * Sometimes, the above configuration is still too restrictive and you want to split specific JSON-RPC methods between different transports. We support
 * this by allowing you to pass in a split transport configuration to make this much simpler.
 * ```ts twoslash
 * import { alchemy } from "@alchemy/common";
 *
 * const transport = alchemy({
 *  // in this example we want to send all eth_chainId requests to a different RPC
 *  overrides: [{
 *    methods: ["eth_chainId"],
 *    transport: http("https://rpc2.url")
 *  }],
 *  // the fallback is where all other methods will be sent to
 *  fallback: http("https://rpc1.url")
 * });
 * ```
 *
 * @param {AlchemyTransportConfig} config The configuration object for the Alchemy transport.
 * @param {number} config.retryDelay Optional The delay between retries, in milliseconds.
 * @param {number} config.retryCount Optional The number of retry attempts.
 * @param {string} [config.alchemyConnection] Optional Alchemy connection configuration (if this is passed in, nodeRpcUrl is required).
 * @param {string} [config.nodeRpcUrl] Optional RPC URL for node (if this is passed in, alchemyConnection is required).
 * @param {Array<{methods: string[], transport: Transport}>} [config.overrides] When provided, fallback is also required as this sets up a split transport
 * @param {Transport} [config.fallback] Optionally required if overrides are provided, this is the fallback transport for the split transport config.
 * @param {string} [config.restConnection] Optionally required if overrides are provided rest connection config for the split transport
 * @param {string} [config.fetchOptions] Optional fetch options for HTTP requests.
 * @param {string} [config.rpcUrl] Optional RPC URL.
 * @param {string} [config.apiKey] Optional API key for Alchemy.
 * @param {string} [config.jwt] Optional JSON Web Token for authorization.
 * @returns {AlchemyTransport} The configured Alchemy transport object.
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
  // we create a copy here in case we create a split transport down below
  // we don't want to add alchemy headers to 3rd party nodes
  const fetchOptions = { ...fetchOptions_ };

  const headersAsObject = convertHeadersToObject(fetchOptions.headers);

  fetchOptions.headers = {
    ...headersAsObject,
    "Alchemy-AA-Sdk-Version": VERSION,
  };

  if (connectionConfig.jwt != null || connectionConfig.apiKey != null) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      Authorization: `Bearer ${
        connectionConfig.jwt ?? connectionConfig.apiKey
      }`,
    };
  }

  const transport: AlchemyTransportBase = (opts) => {
    const { chain } = opts;
    if (!chain) {
      throw new ChainNotFoundError();
    }

    const { innerTransport, rpcUrl } = (() => {
      mutateRemoveTrackingHeaders(config?.fetchOptions?.headers);
      if (
        connectionConfig.overrides != null &&
        connectionConfig.fallback != null
      ) {
        return {
          innerTransport: split(connectionConfig),
          rpcUrl:
            connectionConfig.restConnection.proxyUrl ??
            "https://api.g.alchemy.com/v2",
        };
      }

      if (!connectionConfig.proxyUrl && chain.rpcUrls.alchemy === null) {
        // TODO(v5): update this error message to be the correct package name
        throw new Error(
          "chain must include an alchemy rpc url. See `defineAlchemyChain` or import a chain from `@alchemy/common/chains`."
        );
      }

      const rpcUrl =
        connectionConfig.proxyUrl == null
          ? chain.rpcUrls.alchemy.http[0]
          : connectionConfig.proxyUrl;

      const chainAgnosticRpcUrl =
        connectionConfig.proxyUrl == null
          ? "https://api.g.alchemy.com/v2"
          : connectionConfig.proxyUrl;

      if (
        connectionConfig.alchemyConnection != null &&
        connectionConfig.nodeRpcUrl != null
      ) {
        return {
          rpcUrl,
          innerTransport: split({
            overrides: [
              {
                methods: alchemyMethods,
                transport: http(rpcUrl, {
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
            fallback: http(connectionConfig.nodeRpcUrl, {
              fetchOptions: fetchOptions_,
              retryCount,
              retryDelay,
            }),
          }),
        };
      }

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
                new Error(response.statusText)
              ) satisfies BaseError,
            };
          }

          return { result: await response.json() };
        },
      }
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
  headers?: HeadersInit
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
      {} as Record<string, string>
    );
  }

  return headers;
};
