import {
  Logger,
  createPublicErc4337Client,
  type ConnectionConfig,
} from "@alchemy/aa-core";
import type { Chain } from "viem";
import { SupportedChains } from "../chains.js";
import { InvalidRpcUrlError } from "../errors/rpcUrl.js";
import type { ClientWithAlchemyMethods } from "./types.js";

export const createAlchemyPublicRpcClient = ({
  chain,
  connectionConfig,
}: {
  connectionConfig: ConnectionConfig;
  chain: Chain;
}): ClientWithAlchemyMethods => {
  if (!SupportedChains.has(chain.id)) {
    Logger.warn(
      `[createAlchemyRpcClient] Unsupported chain ${chain.name} (${chain.id}). Some features may not work as expected.`
    );
  }

  const rpcUrl =
    connectionConfig.rpcUrl == null
      ? `${chain.rpcUrls.alchemy.http[0]}/${connectionConfig.apiKey ?? ""}`
      : connectionConfig.rpcUrl;

  if (!rpcUrl) {
    throw new InvalidRpcUrlError({ chain, connectionConfig });
  }

  return createPublicErc4337Client({
    chain: chain,
    rpcUrl,
    ...(connectionConfig.jwt != null && {
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${connectionConfig.jwt}`,
        },
      },
    }),
  });
};
