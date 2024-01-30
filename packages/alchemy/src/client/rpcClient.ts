import { createBundlerClient, type ConnectionConfig } from "@alchemy/aa-core";
import { http, type Chain } from "viem";
import { AlchemyChainSchema } from "../schema.js";
import type { ClientWithAlchemyMethods } from "./types.js";

export const createAlchemyPublicRpcClient = ({
  chain: chain_,
  connectionConfig,
}: {
  connectionConfig: ConnectionConfig;
  chain: Chain;
}): ClientWithAlchemyMethods => {
  const chain = AlchemyChainSchema.parse(chain_);

  const rpcUrl =
    connectionConfig.rpcUrl == null
      ? `${chain.rpcUrls.alchemy.http[0]}/${connectionConfig.apiKey ?? ""}`
      : connectionConfig.rpcUrl;

  return createBundlerClient({
    chain: chain,
    transport: http(rpcUrl, {
      ...(connectionConfig.jwt != null && {
        fetchOptions: {
          headers: {
            Authorization: `Bearer ${connectionConfig.jwt}`,
          },
        },
      }),
    }),
  });
};
