import {
  arbitrum,
  arbitrumGoerli,
  arbitrumSepolia,
  base,
  baseGoerli,
  baseSepolia,
  goerli,
  mainnet,
  optimism,
  optimismGoerli,
  optimismSepolia,
  polygon,
  polygonMumbai,
  sepolia,
} from "@alchemy/aa-core";
import type { Chain } from "viem";

export const SupportedChains = new Map<number, Chain>([
  [polygonMumbai.id, polygonMumbai],
  [polygon.id, polygon],
  [mainnet.id, mainnet],
  [sepolia.id, sepolia],
  [goerli.id, goerli],
  [arbitrumGoerli.id, arbitrumGoerli],
  [arbitrumSepolia.id, arbitrumSepolia],
  [arbitrum.id, arbitrum],
  [optimism.id, optimism],
  [optimismGoerli.id, optimismGoerli],
  [optimismSepolia.id, optimismSepolia],
  [base.id, base],
  [baseGoerli.id, baseGoerli],
  [baseSepolia.id, baseSepolia],
]);
