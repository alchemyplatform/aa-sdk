import type { Address, Chain } from "viem";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  fraxtal,
  fraxtalTestnet,
  goerli,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonAmoy,
  polygonMumbai,
  sepolia,
  zora,
  zoraSepolia,
} from "viem/chains";

export const AlchemyPaymasterAddressV2 =
  "0x4Fd9098af9ddcB41DA48A1d78F91F1398965addc";
export const OldAlchemyPaymasterAddress =
  "0xc03aac639bb21233e0139381970328db8bceeb67";
export const ArbSepoliaPaymasterAddress =
  "0x0804Afe6EEFb73ce7F93CD0d5e7079a5a8068592";
export const AlcehmyPaymasterAddressV3 =
  "0x4f84a207A80c39E9e8BaE717c1F25bA7AD1fB08F";

export const getAlchemyPaymasterAddress = (chain: Chain): Address => {
  switch (chain) {
    case mainnet:
    case arbitrum:
    case optimism:
    case polygon:
    case base:
      return AlchemyPaymasterAddressV2;
    case polygonAmoy:
    case optimismSepolia:
    case baseSepolia:
    case zora:
    case zoraSepolia:
    case fraxtal:
    case fraxtalTestnet:
      return AlcehmyPaymasterAddressV3;
    case arbitrumSepolia:
      return ArbSepoliaPaymasterAddress;
    case sepolia:
    case goerli:
    case polygonMumbai:
      return OldAlchemyPaymasterAddress;
    default:
      return OldAlchemyPaymasterAddress;
  }
};
