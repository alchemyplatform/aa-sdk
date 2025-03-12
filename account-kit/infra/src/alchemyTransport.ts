import {
  ChainNotFoundError,
  ConnectionConfigSchema,
  split,
  tracingHeader,
  UPDATE_HEADER,
  type ConnectionConfig,
  type NoUndefined,
  type UpdateHeader,
  type UpdateHeaderFn,
} from "@aa-sdk/core";
import {
  createTransport,
  http,
  type Chain,
  type EIP1193RequestFn,
  type HttpTransportConfig,
  type PublicRpcSchema,
  type Transport,
  type TransportConfig,
} from "viem";
import type { AlchemyRpcSchema } from "./client/types.js";
import { AlchemyChainSchema } from "./schema.js";
import { VERSION } from "./version.js";

type Never<T> = T extends object
  ? {
      [K in keyof T]?: never;
    }
  : never;

type SplitTransportConfig = {
  alchemyConnection: ConnectionConfig;
  nodeRpcUrl: string;
};

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

export type AlchemyTransportConfig = (
  | (ConnectionConfig & Never<SplitTransportConfig>)
  | (SplitTransportConfig & Never<ConnectionConfig>)
) & {
  /** The max number of times to retry. */
  retryCount?: TransportConfig["retryCount"] | undefined;
  /** The base delay (in ms) between retries. */
  retryDelay?: TransportConfig["retryDelay"] | undefined;
  fetchOptions?: NoUndefined<HttpTransportConfig["fetchOptions"]>;
};

type AlchemyTransportBase = Transport<
  "alchemy",
  {
    alchemyRpcUrl: string;
    fetchOptions?: AlchemyTransportConfig["fetchOptions"];
  },
  EIP1193RequestFn<[...PublicRpcSchema, ...AlchemyRpcSchema]>
>;

export type AlchemyTransport = AlchemyTransportBase & {
  updateHeaders(newHeaders: HeadersInit): void;
  config: AlchemyTransportConfig;
} & UpdateHeader<AlchemyTransportBase>;

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
 * ```ts
 * import { alchemy } from "@account-kit/infra";
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
 * ```ts
 * import { alchemy } from "@account-kit/infra";
 *
 * const transport = alchemy({
 *  alchemyConnection: {
 *    apiKey: "your-api-key",
 *  },
 *  nodeRpcUrl: "https://zora.rpc.url",
 * });
 * ```
 *
 * @param {AlchemyTransportConfig} config The configuration object for the Alchemy transport.
 * @param {number} config.retryDelay Optional The delay between retries, in milliseconds.
 * @param {number} config.retryCount Optional The number of retry attempts.
 * @param {string} [config.alchemyConnection] Optional Alchemy connection configuration (if this is passed in, nodeRpcUrl is required).
 * @param {string} [config.fetchOptions] Optional fetch options for HTTP requests.
 * @param {string} [config.nodeRpcUrl] Optional RPC URL for node (if this is passed in, alchemyConnection is required).
 * @param {string} [config.rpcUrl] Optional RPC URL.
 * @param {string} [config.apiKey] Optional API key for Alchemy.
 * @param {string} [config.jwt] Optional JSON Web Token for authorization.
 * @returns {AlchemyTransport} The configured Alchemy transport object.
 */
export function alchemy(config: AlchemyTransportConfig): AlchemyTransport {
  const { retryDelay, retryCount } = config;
  // we create a copy here in case we create a split transport down below
  // we don't want to add alchemy headers to 3rd party nodes
  const fetchOptions = { ...config.fetchOptions };

  const connectionConfig = ConnectionConfigSchema.parse(
    config.alchemyConnection ?? config
  );

  const headersAsObject = convertHeadersToObject(fetchOptions.headers);

  // TODO: we probably should just log these headers during telemetry logging instead of doing this mutable header stuff
  fetchOptions.headers = {
    ...headersAsObject,
    "Alchemy-AA-Sdk-Version": VERSION,
  };

  if (connectionConfig.jwt != null) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      Authorization: `Bearer ${connectionConfig.jwt}`,
    };
  }

  const transport: AlchemyTransportBase = (opts) => {
    const { chain: chain_ } = opts;
    if (!chain_) {
      throw new ChainNotFoundError();
    }
    const chain = AlchemyChainSchema.parse(chain_);

    const rpcUrl =
      connectionConfig.rpcUrl == null
        ? `${chain.rpcUrls.alchemy.http[0]}/${connectionConfig.apiKey ?? ""}`
        : connectionConfig.rpcUrl;

    const innerTransport = tracingHeader({
      transport: (() => {
        if (config.alchemyConnection && config.nodeRpcUrl) {
          return split({
            overrides: [
              {
                methods: alchemyMethods,
                transport: http(rpcUrl, { fetchOptions }),
              },
            ],
            fallback: http(config.nodeRpcUrl, {
              fetchOptions: config.fetchOptions,
            }),
          });
        }

        return http(rpcUrl, { fetchOptions });
      })(),
    });

    return createTransport(
      {
        key: "alchemy",
        name: "Alchemy Transport",
        request: innerTransport(opts).request,
        retryCount: retryCount ?? opts?.retryCount,
        retryDelay,
        type: "alchemy",
      },
      { alchemyRpcUrl: rpcUrl, fetchOptions }
    );
  };

  return Object.assign(transport, {
    [UPDATE_HEADER](updateHeaders: UpdateHeaderFn) {
      const previous = convertHeadersToObject(config.fetchOptions?.headers);
      const headers = updateHeaders(previous);
      return alchemy({
        ...config,
        fetchOptions: {
          ...config.fetchOptions,
          headers,
        },
      });
    },
    updateHeaders(newHeaders_: HeadersInit) {
      const newHeaders = convertHeadersToObject(newHeaders_);

      fetchOptions.headers = {
        ...fetchOptions.headers,
        ...newHeaders,
      };
    },
    config,
  }) as AlchemyTransport;
}

const convertHeadersToObject = (
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
    return headers.reduce((acc, header) => {
      acc[header[0]] = header[1];
      return acc;
    }, {} as Record<string, string>);
  }

  return headers;
};
