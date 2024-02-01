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

export type BundlerClient<T extends Transport = Transport> = Client<
  T,
  Chain,
  undefined,
  [...PublicRpcSchema, ...BundlerRpcSchema],
  PublicActions<T, Chain> & BundlerActions
>;

export const createBundlerClientFromExisting: <
  T extends Transport | FallbackTransport = Transport
>(
  client: PublicClient<T, Chain>
) => BundlerClient<T> = <T extends Transport | FallbackTransport = Transport>(
  client: PublicClient<T, Chain>
): BundlerClient<T> => {
  return client.extend(bundlerActions);
};

/**
 * Creates a PublicClient with methods for calling Bundler RPC methods
 * @returns
 */
export function createBundlerClient<TTransport extends Transport>(
  args: PublicClientConfig<TTransport, Chain> & { type?: string }
): BundlerClient<TTransport>;

export function createBundlerClient(
  args: PublicClientConfig & { type?: string }
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
      const { url, fetchOptions } = resolvedTransport.value as {
        fetchOptions: HttpTransportConfig["fetchOptions"];
        url: string;
      };

      return createClient<Transport, Chain>({
        ...baseParameters,
        transport: http(url, {
          ...resolvedTransport.config,
          fetchOptions: {
            ...fetchOptions,
            headers: {
              ...fetchOptions?.headers,
              "Alchemy-AA-Sdk-Version": VERSION,
            },
          },
        }),
      });
    }

    return createClient<Transport, Chain>(baseParameters);
  })();

  return client.extend(publicActions).extend(bundlerActions);
}
