import { encodeFunctionData, type Address, type Chain, type Hex } from "viem";
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
  unichainSepolia,
  worldChainSepolia,
  sepolia,
  zora,
  zoraSepolia,
  shapeSepolia,
  optimismGoerli,
  arbitrumGoerli,
  arbitrumNova,
  baseGoerli,
  beraChainBartio,
  celoAlfajores,
  celoMainnet,
  gensynTestnet,
  goerli,
  inkMainnet,
  inkSepolia,
  monadTestnet,
  opbnbMainnet,
  opbnbTestnet,
  openlootSepolia,
  polygonMumbai,
  riseTestnet,
  shape,
  soneiumMainnet,
  soneiumMinato,
  storyAeneid,
  storyMainnet,
  teaSepolia,
  unichainMainnet,
  worldChain,
} from "./chains.js";
import type { EntryPointVersion } from "@aa-sdk/core";
export const AlchemyPaymasterAddressV06Unify =
  "0x0000000000ce04e2359130e7d0204A5249958921";
export const AlchemyPaymasterAddressV07Unify =
  "0x00000000000667F27D4DB42334ec11a25db7EBb4";

export const AlchemyPaymasterAddressV4 =
  "0xEaf0Cde110a5d503f2dD69B3a49E031e29b3F9D2";
export const AlchemyPaymasterAddressV3 =
  "0x4f84a207A80c39E9e8BaE717c1F25bA7AD1fB08F";
export const AlchemyPaymasterAddressV2 =
  "0x4Fd9098af9ddcB41DA48A1d78F91F1398965addc";
export const ArbSepoliaPaymasterAddress =
  "0x0804Afe6EEFb73ce7F93CD0d5e7079a5a8068592";
export const AlchemyPaymasterAddressV1 =
  "0xc03aac639bb21233e0139381970328db8bceeb67";

export const AlchemyPaymasterAddressV07V2 =
  "0x2cc0c7981D846b9F2a16276556f6e8cb52BfB633";
export const AlchemyPaymasterAddressV07V1 =
  "0xEF725Aa22d43Ea69FB22bE2EBe6ECa205a6BCf5B";

/**
 * Retrieves the Alchemy paymaster address for the given chain. Returns different addresses based on the chain ID.
 *
 * @example
 * ```ts
 * import { sepolia, getAlchemyPaymasterAddress } from "@account-kit/infra";
 *
 * const paymasterAddress = getAlchemyPaymasterAddress(sepolia, "0.6.0");
 * ```
 *
 * @param {Chain} chain The chain for which the paymaster address is required
 * @param {EntryPointVersion} version The version of the entry point
 * @returns {Address} The Alchemy paymaster address corresponding to the specified chain
 */
export const getAlchemyPaymasterAddress = (
  chain: Chain,
  version: EntryPointVersion,
): Address => {
  switch (version) {
    case "0.6.0":
      switch (chain.id) {
        case fraxtalSepolia.id:
        case worldChainSepolia.id:
        case shapeSepolia.id:
        case unichainSepolia.id:
        case opbnbTestnet.id:
        case inkSepolia.id:
        case monadTestnet.id:
        case openlootSepolia.id:
        case gensynTestnet.id:
        case riseTestnet.id:
        case storyAeneid.id:
        case teaSepolia.id:
        case arbitrumGoerli.id:
        case goerli.id:
        case optimismGoerli.id:
        case baseGoerli.id:
        case polygonMumbai.id:
        case worldChain.id:
        case shape.id:
        case unichainMainnet.id:
        case soneiumMinato.id:
        case soneiumMainnet.id:
        case opbnbMainnet.id:
        case beraChainBartio.id:
        case inkMainnet.id:
        case arbitrumNova.id:
        case storyMainnet.id:
        case celoAlfajores.id:
        case celoMainnet.id:
          return AlchemyPaymasterAddressV4;
        case polygonAmoy.id:
        case optimismSepolia.id:
        case baseSepolia.id:
        case zora.id:
        case zoraSepolia.id:
        case fraxtal.id:
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
          return AlchemyPaymasterAddressV1;
        default:
          return AlchemyPaymasterAddressV06Unify;
      }
    case "0.7.0":
      switch (chain.id) {
        case arbitrumNova.id:
        case celoAlfajores.id:
        case celoMainnet.id:
        case gensynTestnet.id:
        case inkMainnet.id:
        case inkSepolia.id:
        case monadTestnet.id:
        case opbnbMainnet.id:
        case opbnbTestnet.id:
        case openlootSepolia.id:
        case riseTestnet.id:
        case shape.id:
        case shapeSepolia.id:
        case soneiumMainnet.id:
        case soneiumMinato.id:
        case storyAeneid.id:
        case storyMainnet.id:
        case teaSepolia.id:
        case unichainMainnet.id:
        case unichainSepolia.id:
        case worldChain.id:
        case worldChainSepolia.id:
          return AlchemyPaymasterAddressV07V1;
        case arbitrum.id:
        case arbitrumGoerli.id:
        case arbitrumSepolia.id:
        case base.id:
        case baseGoerli.id:
        case baseSepolia.id:
        case beraChainBartio.id:
        case fraxtal.id:
        case fraxtalSepolia.id:
        case goerli.id:
        case mainnet.id:
        case optimism.id:
        case optimismGoerli.id:
        case optimismSepolia.id:
        case polygon.id:
        case polygonAmoy.id:
        case polygonMumbai.id:
        case sepolia.id:
        case zora.id:
        case zoraSepolia.id:
          return AlchemyPaymasterAddressV07V2;
        default:
          return AlchemyPaymasterAddressV07Unify;
      }
    default:
      throw new Error(`Unsupported EntryPointVersion: ${version}`);
  }
};

export const PermitTypes = {
  EIP712Domain: [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
  ],
  Permit: [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
} as const;

export const ERC20Abis = [
  "function decimals() public view returns (uint8)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
] as const;

export const EIP7597Abis = [
  "function nonces(address owner) external view returns (uint)",
] as const;

export const approveTokenCallData = (
  paymasterAddress: Address,
  allowance: BigInt,
) => {
  return encodeFunctionData({
    abi: ERC20Abis,
    functionName: "approve",
    args: [paymasterAddress, allowance],
  });
};

export type PermitMessage = {
  owner: Hex;
  spender: Hex;
  value: bigint;
  nonce: bigint;
  deadline: bigint;
};

export type PermitDomain = {
  name: string;
  version: string;
  chainId: bigint;
  verifyingContract: Hex;
};
