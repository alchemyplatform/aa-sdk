import { chains, getDefaultAddressMap } from "@alchemy/aa-core";
import type { Address, Chain } from "viem";
import {
  arbitrum,
  arbitrumGoerli,
  base,
  baseGoerli,
  goerli,
  mainnet,
  optimism,
  optimismGoerli,
  polygon,
  polygonMumbai,
  sepolia,
} from "viem/chains";

/**
 * Utility method returning the default simple account factory address given a {@link chains.Chain} object
 *
 * @param chain - a {@link chains.Chain} object
 * @returns a {@link abi.Address} for the given chain
 * @throws if the chain doesn't have an address currently deployed
 */
export const getDefaultSimpleAccountFactory = async (
  chain: Chain
): Promise<Address> => {
  const defaultAddressMap = await getDefaultAddressMap();
  if (defaultAddressMap?.[chain.id]?.simpleAccountFactoryAddress) {
    return defaultAddressMap[chain.id].simpleAccountFactoryAddress as Address;
  }

  switch (chain.id) {
    case mainnet.id:
    case polygon.id:
    case optimism.id:
    case arbitrum.id:
    case base.id:
    case baseGoerli.id:
      return "0x15Ba39375ee2Ab563E8873C8390be6f2E2F50232";
    case sepolia.id:
    case goerli.id:
    case polygonMumbai.id:
    case optimismGoerli.id:
    case arbitrumGoerli.id:
      return "0x9406Cc6185a346906296840746125a0E44976454";
  }

  throw new Error("could not find light account factory address");
};

/**
 * Utility method returning the default light account factory address given a {@link chains.Chain} object
 *
 * @param chain - a {@link chains.Chain} object
 * @returns a {@link abi.Address} for the given chain
 * @throws if the chain doesn't have an address currently deployed
 */
export const getDefaultLightAccountFactory = async (
  chain: Chain
): Promise<Address> => {
  const defaultAddressMap = await getDefaultAddressMap();
  if (defaultAddressMap?.[chain.id]?.lightAccountFactoryAddress) {
    return defaultAddressMap[chain.id].lightAccountFactoryAddress as Address;
  }

  switch (chain.id) {
    case mainnet.id:
    case sepolia.id:
    case goerli.id:
    case polygon.id:
    case polygonMumbai.id:
    case optimism.id:
    case optimismGoerli.id:
    case arbitrum.id:
    case arbitrumGoerli.id:
    case base.id:
    case baseGoerli.id:
      return "0x000000893A26168158fbeaDD9335Be5bC96592E2";
  }
  throw new Error("could not find light account factory address");
};
