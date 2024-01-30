import {
  createPublicClient,
  http,
  type Chain,
  type Client,
  type FallbackTransport,
  type HttpTransport,
  type HttpTransportConfig,
  type PublicActions,
  type PublicClient,
  type PublicRpcSchema,
  type Transport,
} from "viem";
import { VERSION } from "../version.js";
import {
  erc4337ClientActions,
  type Erc4337Actions,
  type Erc4337RpcSchema,
} from "./decorators/publicErc4337Client.js";

export type PublicErc4337Client<T extends Transport = Transport> = Client<
  T,
  Chain,
  undefined,
  [...PublicRpcSchema, ...Erc4337RpcSchema],
  PublicActions<T, Chain> & Erc4337Actions
>;

export const createPublicErc4337FromClient: <
  T extends Transport | FallbackTransport = Transport
>(
  client: PublicClient<T, Chain>
) => PublicErc4337Client<T> = <
  T extends Transport | FallbackTransport = Transport
>(
  client: PublicClient<T, Chain>
): PublicErc4337Client<T> => {
  return client.extend(erc4337ClientActions);
};

/**
 * Creates a PublicClient with methods for calling Bundler RPC methods
 * @returns
 */
export const createPublicErc4337Client = ({
  chain,
  rpcUrl,
  fetchOptions,
}: {
  chain: Chain;
  rpcUrl: string;
  fetchOptions?: HttpTransportConfig["fetchOptions"];
}): PublicErc4337Client<HttpTransport> => {
  const client = createPublicErc4337FromClient(
    createPublicClient({
      chain,
      transport: http(rpcUrl, {
        fetchOptions: {
          ...fetchOptions,
          headers: {
            ...fetchOptions?.headers,
            "Alchemy-AA-Sdk-Version": VERSION,
          },
        },
      }),
    })
  );

  return client;
};
