import {
  arbitrum,
  base,
  baseGoerli,
  optimism,
  optimismGoerli,
  polygon,
  polygonMumbai,
  sepolia,
} from "viem/chains";
import { env } from "~/env.mjs";

// TODO: Replace with your own api urls per chain.
const API_URLs: Record<number, string> = {
  [polygonMumbai.id]: env.MUMBAI_ALCHEMY_API_URL,
  [sepolia.id]: env.SEPOLIA_ALCHEMY_API_URL,
  [polygon.id]: env.POLYGON_ALCHEMY_API_URL,
  [arbitrum.id]: env.ARB_ALCHEMY_API_URL,
  [optimism.id]: env.OPT_ALCHEMY_API_URL,
  [optimismGoerli.id]: env.OPT_GOERLI_ALCHEMY_API_URL,
  [base.id]: env.BASE_ALCHEMY_API_URL,
  [baseGoerli.id]: env.BASE_GOERLI_ALCHEMY_API_URL,
};

export function getApiUrl(chainId: number | string) {
  const API_URL = API_URLs[Number(chainId)];
  if (!API_URL) {
    throw new Error("Unsupported chainID.");
  }
  return API_URL;
}
