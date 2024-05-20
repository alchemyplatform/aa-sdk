import { switchChain } from "@wagmi/core";
import type { Chain } from "viem";
import { createAlchemyPublicRpcClient } from "../../client/rpcClient.js";
import { ChainNotFoundError } from "../errors.js";
import type { AlchemyAccountsConfig } from "../types";

/**
 * Allows you to change the current chain in the core store
 *
 * @param config the accounts config object
 * @param chain the chain to change to. It must be present in the connections config object
 */
export async function setChain(config: AlchemyAccountsConfig, chain: Chain) {
  const connection = config.coreStore.getState().connections.get(chain.id);
  if (connection == null) {
    throw new ChainNotFoundError(chain);
  }

  await switchChain(config._internal.wagmiConfig, { chainId: chain.id });

  config.coreStore.setState(() => ({
    chain,
    bundlerClient: createAlchemyPublicRpcClient({
      chain,
      connectionConfig: connection,
    }),
  }));
}
