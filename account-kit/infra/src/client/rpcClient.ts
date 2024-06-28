import {
  createBundlerClient,
  type ConnectionConfig,
  type NoUndefined,
} from "@aa-sdk/core";
import { http, type Chain, type HttpTransportConfig } from "viem";
import { AlchemyChainSchema } from "../schema.js";
import { VERSION } from "../version.js";
import type { ClientWithAlchemyMethods } from "./types.js";

/**
 * Creates an Alchemy public RPC client with the provided chain, connection configuration, and optional fetch options. The client has alchemy methods and can dynamically update HTTP headers.
 *
 * @example
 * ```ts
 * import { createAlchemyPublicRpcClient } from "@account-kit/infra";
 * import { sepolia } from "@account-kit/infra";
 *
 * const client = createAlchemyPublicRpcClient({
 *  chain: sepolia,
 *  connectionConfig: {
 *    apiKey: "your-api-key",
 *  }
 * });
 * ```
 *
 * @param {{connectionConfig: ConnectionConfig,chain: Chain,fetchOptions?: NoUndefined<HttpTransportConfig["fetchOptions"]>}} params The parameters for creating the Alchemy public RPC client
 * @param {ConnectionConfig} params.connectionConfig The connection configuration containing the RPC URL and API key
 * @param {Chain} params.chain The blockchain chain configuration
 * @param {NoUndefined<HttpTransportConfig["fetchOptions"]>} [params.fetchOptions] Optional fetch configuration for HTTP transport
 * @returns {ClientWithAlchemyMethods} A client object tailored with Alchemy methods and capabilities to interact with the blockchain
 */
export const createAlchemyPublicRpcClient = ({
  chain: chain_,
  connectionConfig,
  fetchOptions = {},
}: {
  connectionConfig: ConnectionConfig;
  chain: Chain;
  fetchOptions?: NoUndefined<HttpTransportConfig["fetchOptions"]>;
}): ClientWithAlchemyMethods => {
  const chain = AlchemyChainSchema.parse(chain_);

  const rpcUrl =
    connectionConfig.rpcUrl == null
      ? `${chain.rpcUrls.alchemy.http[0]}/${connectionConfig.apiKey ?? ""}`
      : connectionConfig.rpcUrl;

  fetchOptions.headers = {
    ...fetchOptions.headers,
    "Alchemy-AA-Sdk-Version": VERSION,
  };

  if (connectionConfig.jwt != null) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      Authorization: `Bearer ${connectionConfig.jwt}`,
    };
  }

  return createBundlerClient({
    chain: chain,
    transport: http(rpcUrl, { fetchOptions }),
  }).extend(() => ({
    updateHeaders(newHeaders: HeadersInit) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        ...newHeaders,
      };
    },
  }));
};
