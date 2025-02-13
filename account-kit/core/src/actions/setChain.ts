import { alchemy, createAlchemyPublicRpcClient } from "@account-kit/infra";
import { switchChain } from "@wagmi/core";
import type { Chain } from "viem";
import { ChainNotFoundError } from "../errors.js";
import type { AlchemyAccountsConfig } from "../types.js";

/**
 * Allows you to change the current chain in the core store. Note, this chain
 * must be one of the chains configured in your original createConfig call.
 *
 * @example
 * ```ts
 * import { setChain } from "@account-kit/core";
 * import { config } from "./config";
 * import { sepolia } from "@account-kit/infra";
 *
 * await setChain(config, sepolia);
 * ```
 *
 * @param {AlchemyAccountsConfig} config the accounts config object
 * @param {Chain} chain the chain to change to. It must be present in the connections config object
 */
export async function setChain(config: AlchemyAccountsConfig, chain: Chain) {
  const connection = config.store.getState().connections.get(chain.id);
  if (connection == null) {
    throw new ChainNotFoundError(chain);
  }

  await switchChain(config._internal.wagmiConfig, { chainId: chain.id });
  const transport = connection.transport;

  config.store.setState(() => ({
    chain,
    bundlerClient: createAlchemyPublicRpcClient({
      chain,
      transport: alchemy(transport),
    }),
  }));
}
