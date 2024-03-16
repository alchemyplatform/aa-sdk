import {
  createBundlerClient,
  type ConnectionConfig,
  type EntryPointVersion,
} from "@alchemy/aa-core";
import { http, type Chain } from "viem";
import { AlchemyChainSchema } from "../schema.js";
import type { ClientWithAlchemyMethods } from "./types.js";

export const createAlchemyPublicRpcClient = <
  TEntryPointVersion extends EntryPointVersion
>({
  chain: chain_,
  connectionConfig,
}: {
  connectionConfig: ConnectionConfig;
  chain: Chain;
}): ClientWithAlchemyMethods<TEntryPointVersion> => {
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
