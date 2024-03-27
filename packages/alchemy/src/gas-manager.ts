import type { Address, Chain } from "viem";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  fraxtal,
  fraxtalTestnet,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonAmoy,
  zora,
  zoraSepolia,
} from "viem/chains";

export const NewAlchemyPaymasterAddress =
  "0x4Fd9098af9ddcB41DA48A1d78F91F1398965addc";
export const OldAlchemyPaymasterAddress =
  "0xc03aac639bb21233e0139381970328db8bceeb67";
export const ArbSepoliaPaymasterAddress =
  "0x0804Afe6EEFb73ce7F93CD0d5e7079a5a8068592";

export const getAlchemyPaymasterAddress = (chain: Chain): Address => {
  switch (chain) {
    case mainnet:
    case optimism:
    case polygon:
    case arbitrum:
    case polygonAmoy:
    case optimismSepolia:
    case base:
    case baseSepolia:
    case zora:
    case zoraSepolia:
    case fraxtal:
    case fraxtalTestnet:
      return NewAlchemyPaymasterAddress;
    case arbitrumSepolia:
      return OldAlchemyPaymasterAddress;
    default:
      return ArbSepoliaPaymasterAddress;
  }
};
