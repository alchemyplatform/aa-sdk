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
import type { EntryPointVersion } from "../entrypoint/types.js";
import { ChainNotFoundError } from "../errors/client.js";
import { VERSION } from "../version.js";
import {
  bundlerActions,
  type BundlerActions,
  type BundlerRpcSchema,
} from "./decorators/bundlerClient.js";

//#region BundlerClient
export type BundlerClient<
  TEntryPointVersion extends EntryPointVersion,
  T extends Transport
> = Client<
  T,
  Chain,
  undefined,
  [...PublicRpcSchema, ...BundlerRpcSchema<TEntryPointVersion>],
  PublicActions<T, Chain> & BundlerActions<TEntryPointVersion>
>;

export const createBundlerClientFromExisting: <
  T extends Transport | FallbackTransport = Transport,
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
>(
  client: PublicClient<T, Chain>
) => BundlerClient<TEntryPointVersion, T> = <
  T extends Transport | FallbackTransport = Transport,
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
>(
  client: PublicClient<T, Chain>
): BundlerClient<TEntryPointVersion, T> => {
  return client.extend(
    bundlerActions<TEntryPointVersion, PublicClient<T, Chain>>
  );
};
//#endregion BundlerClient

/**
 * Creates a PublicClient with methods for calling Bundler RPC methods
 * @returns
 */
export function createBundlerClient<
  TEntryPointVersion extends EntryPointVersion,
  TTransport extends Transport
>(
  args: PublicClientConfig<TTransport, Chain> & { type?: string }
): BundlerClient<TEntryPointVersion, TTransport>;

export function createBundlerClient<
  TEntryPointVersion extends EntryPointVersion,
  TTransport extends Transport
>(
  args: PublicClientConfig<TTransport, Chain> & { type?: string }
): BundlerClient<TEntryPointVersion, TTransport> {
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
              ...(url.toLowerCase().indexOf("alchemy") > -1
                ? { "Alchemy-AA-Sdk-Version": VERSION }
                : undefined),
            },
          },
        }),
      });
    }

    return createClient<Transport, Chain>(baseParameters);
  })();

  return client
    .extend(publicActions<TTransport, Chain>)
    .extend(
      bundlerActions<TEntryPointVersion, PublicClient<TTransport, Chain>>
    );
}
