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
  base,
  baseGoerli,
} from "viem/chains";

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
  [base.id, base],
  [baseGoerli.id, baseGoerli],
]);
