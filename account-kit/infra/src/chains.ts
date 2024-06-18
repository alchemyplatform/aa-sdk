import type { Chain } from "viem";

export type AlchemyChainConfig = {
  chain: Chain;
  rpcBaseUrl: string;
};

/**
 * Defines an Alchemy chain configuration by adding an Alchemy-specific RPC base URL to the chain's RPC URLs.
 *
 * @example
 * ```ts
 * import { defineAlchemyChain } from "@account-kit/infra";
 * import { sepolia } from "viem/chains";
 *
 * const chain = defineAlchemyChain({
 *  chain: sepolia,
 *  rpcBaseUrl: "https://eth-sepolia.g.alchemy.com/v2"
 * });
 * ```
 *
 * @param {AlchemyChainConfig} params The parameters for defining the Alchemy chain
 * @param {Chain} params.chain The original chain configuration
 * @param {string} params.rpcBaseUrl The Alchemy-specific RPC base URL
 * @returns {Chain} The updated chain configuration with the Alchemy RPC URL added
 */
export const defineAlchemyChain = ({
  chain,
  rpcBaseUrl,
}: {
  chain: Chain;
  rpcBaseUrl: string;
}): Chain => {
  return {
    ...chain,
    rpcUrls: {
      ...chain.rpcUrls,
      alchemy: {
        http: [rpcBaseUrl],
      },
    },
  };
};
