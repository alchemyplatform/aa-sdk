import {
  createBundlerClient,
  type ConnectionConfig,
  type NoUndefined,
} from "@alchemy/aa-core";
import { http, type Chain, type HttpTransportConfig } from "viem";
import { AlchemyChainSchema } from "../schema.js";
import { VERSION } from "../version.js";
import type { ClientWithAlchemyMethods } from "./types.js";

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
