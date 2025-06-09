import {
  createClient,
  http,
  publicActions,
  type Chain,
  type Client,
  type FallbackTransport,
  type HttpTransportConfig,
  type PublicActions,
  type PublicClient,
  type PublicClientConfig,
  type PublicRpcSchema,
  type Transport,
} from "viem";
import { ChainNotFoundError } from "../errors/client.js";
import { VERSION } from "../version.js";
import {
  bundlerActions,
  type BundlerActions,
  type BundlerRpcSchema,
} from "./decorators/bundlerClient.js";

// [!region BundlerClient]
export type BundlerClient<T extends Transport = Transport> = Client<
  T,
  Chain,
  undefined,
  [...PublicRpcSchema, ...BundlerRpcSchema],
  PublicActions<T, Chain> & BundlerActions
>;

/**
 * Creates a bundler client from an existing public client with the provided transport and chain.
 *
 * @example
 * ```ts
 * import { createPublicClient } from "viem";
 * import { createBundlerClientFromExisting } from "@aa-sdk/core";
 *
 * const publicClient = createPublicClient(...);
 * const bundlerClient = createBundlerClientFromExisting(publicClient);
 * ```
 *
 * @param {PublicClient<T, Chain>} client The existing public client to be extended with bundler actions
 * @returns {BundlerClient<T>} A bundler client that extends the functionality of the provided public client
 */
export const createBundlerClientFromExisting: <
  T extends Transport | FallbackTransport = Transport,
>(
  client: PublicClient<T, Chain>,
) => BundlerClient<T> = <T extends Transport | FallbackTransport = Transport>(
  client: PublicClient<T, Chain>,
): BundlerClient<T> => {
  return client.extend(bundlerActions);
};
// [!endregion BundlerClient]

/**
 * Creates a PublicClient with methods for calling Bundler RPC methods
 *
 * @param {PublicClientConfig<TTransport, Chain> & { type?: string }} args - configuration for the client
 * @returns {BundlerClient<TTransport>} a PublicClient with methods for calling Bundler RPC methods
 */
export function createBundlerClient<TTransport extends Transport>(
  args: PublicClientConfig<TTransport, Chain> & { type?: string },
): BundlerClient<TTransport>;

/**
 * Creates a Bundler Client using the provided configuration parameters, including chain and optional type.
 *
 * @example
 * ```ts
 * import { createBundlerClient } from "@aa-sdk/core";
 * import { sepolia } from "viem/chains";
 *
 * const client = createBundlerClient({
 *  chain: sepolia,
 *  transport: http("RPC_URL"),
 * });
 * ```
 *
 * @param {PublicClientConfig & { type?: string }} args Configuration for creating the Bundler Client, including parameters for the chain, transport, and optional type
 * @returns {BundlerClient} The created Bundler Client with extended public and bundler actions
 */
export function createBundlerClient(
  args: PublicClientConfig & { type?: string },
): BundlerClient {
  if (!args.chain) {
    throw new ChainNotFoundError();
  }
  const {
    key = "bundler-public",
    name = "Public Bundler Client",
    type = "bundlerClient",
  } = args;

  const { transport, ...opts } = args;
  const resolvedTransport = transport({
    chain: args.chain,
    pollingInterval: opts.pollingInterval,
  });

  const baseParameters = {
    ...args,
    key,
    name,
    type,
  };

  const client = (() => {
    if (resolvedTransport.config.type === "http") {
      const { url, fetchOptions: fetchOptions_ } = resolvedTransport.value as {
        fetchOptions: HttpTransportConfig["fetchOptions"];
        url: string;
      };

      const fetchOptions = fetchOptions_ ?? {};

      if (url.toLowerCase().indexOf("alchemy") > -1) {
        fetchOptions.headers = {
          ...fetchOptions.headers,
          "Alchemy-AA-Sdk-Version": VERSION,
        };
      }

      return createClient<Transport, Chain>({
        ...baseParameters,
        transport: http(url, {
          ...resolvedTransport.config,
          fetchOptions,
        }),
      });
    }

    return createClient<Transport, Chain>(baseParameters);
  })();

  return client.extend(publicActions).extend(bundlerActions);
}
