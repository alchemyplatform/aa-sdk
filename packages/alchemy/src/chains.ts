import type { Chain } from "viem";
import {
  arbitrum,
  arbitrumGoerli,
  goerli,
  mainnet,
  optimism,
  optimismGoerli,
  polygon,
  polygonMumbai,
  sepolia,
} from "viem/chains";
import { GasFeeStrategy, type GasFeeMode } from "./middleware/gas-fees.js";

export const SupportedChains = new Map<number, Chain>([
  [polygonMumbai.id, polygonMumbai],
  [polygon.id, polygon],
  [mainnet.id, mainnet],
  [sepolia.id, sepolia],
  [goerli.id, goerli],
  [arbitrumGoerli.id, arbitrumGoerli],
  [arbitrum.id, arbitrum],
  [optimism.id, optimism],
  [optimismGoerli.id, optimismGoerli],
]);

const defineChainStrategy = (
  chainId: number,
  strategy: GasFeeStrategy,
  value: GasFeeMode["value"]
): [number, GasFeeMode] => {
  return [chainId, { strategy, value }];
};

export const ChainFeeStrategies: Map<number, GasFeeMode> = new Map<
  number,
  GasFeeMode
>([
  // testnets
  defineChainStrategy(goerli.id, GasFeeStrategy.FIXED, 0n),
  defineChainStrategy(sepolia.id, GasFeeStrategy.FIXED, 0n),
  defineChainStrategy(polygonMumbai.id, GasFeeStrategy.FIXED, 0n),
  defineChainStrategy(
    optimismGoerli.id,
    GasFeeStrategy.BASE_FEE_PERCENTAGE,
    0n
  ),
  defineChainStrategy(
    arbitrumGoerli.id,
    GasFeeStrategy.BASE_FEE_PERCENTAGE,
    0n
  ),
  // mainnets
  defineChainStrategy(mainnet.id, GasFeeStrategy.PRIORITY_FEE_PERCENTAGE, 57n),
  defineChainStrategy(polygon.id, GasFeeStrategy.PRIORITY_FEE_PERCENTAGE, 25n),
  defineChainStrategy(optimism.id, GasFeeStrategy.BASE_FEE_PERCENTAGE, 5n),
  defineChainStrategy(arbitrum.id, GasFeeStrategy.BASE_FEE_PERCENTAGE, 5n),
]);
