import type { Address, Chain } from "viem";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  fraxtal,
  fraxtalSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonAmoy,
  polygonMumbai,
  sepolia,
  zora,
  zoraSepolia,
} from "./chains.js";

export const AlchemyPaymasterAddressV3 =
  "0x4f84a207A80c39E9e8BaE717c1F25bA7AD1fB08F";
export const AlchemyPaymasterAddressV2 =
  "0x4Fd9098af9ddcB41DA48A1d78F91F1398965addc";
export const ArbSepoliaPaymasterAddress =
  "0x0804Afe6EEFb73ce7F93CD0d5e7079a5a8068592";
export const AlchemyPaymasterAddressV1 =
  "0xc03aac639bb21233e0139381970328db8bceeb67";

/**
 * Retrieves the Alchemy paymaster address for the given chain. Returns different addresses based on the chain ID.
 *
 * @example
 * ```ts
 * import { sepolia, getAlchemyPaymasterAddress } from "@account-kit/infra";
 *
 * const paymasterAddress = getAlchemyPaymasterAddress(sepolia);
 * ```
 *
 * @param {Chain} chain The chain for which the paymaster address is required
 * @returns {Address} The Alchemy paymaster address corresponding to the specified chain
 */
export const getAlchemyPaymasterAddress = (chain: Chain): Address => {
  switch (chain.id) {
    case polygonAmoy.id:
    case optimismSepolia.id:
    case baseSepolia.id:
    case zora.id:
    case zoraSepolia.id:
    case fraxtal.id:
    case fraxtalSepolia.id:
      return AlchemyPaymasterAddressV3;
    case mainnet.id:
    case arbitrum.id:
    case optimism.id:
    case polygon.id:
    case base.id:
      return AlchemyPaymasterAddressV2;
    case arbitrumSepolia.id:
      return ArbSepoliaPaymasterAddress;
    case sepolia.id:
    case polygonMumbai.id:
      return AlchemyPaymasterAddressV1;
    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
};
