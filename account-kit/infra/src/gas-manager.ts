import { encodeFunctionData, type Address, type Chain, type Hex } from "viem";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  fraxtal,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonAmoy,
  sepolia,
  zora,
  zoraSepolia,
} from "./chains.js";
import type { EntryPointVersion } from "@aa-sdk/core";

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

export const AlchemyPaymasterAddressV07Mainnet =
  "0x2cc0c7981D846b9F2a16276556f6e8cb52BfB633";
export const AlchemyPaymasterAddressV07Testnet =
  "0xEF725Aa22d43Ea69FB22bE2EBe6ECa205a6BCf5B";

/**
 * Retrieves the Alchemy paymaster address for the given chain. Returns different addresses based on the chain ID.
 *
 * @example
 * ```ts
 * import { sepolia, getAlchemyPaymasterAddress } from "@account-kit/infra";
 *
 * const paymasterAddress = getAlchemyPaymasterAddress(sepolia, "0.6");
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
          return AlchemyPaymasterAddressV4;
      }
    case "0.7.0":
      if (chain.testnet) {
        return AlchemyPaymasterAddressV07Testnet;
      }
      return AlchemyPaymasterAddressV07Mainnet;
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

export const EIP20Abis = [
  "function nonces(address owner) external view returns (uint)",
  "function decimals() public view returns (uint8)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
] as const;

export const approveTokenCallData = (
  paymasterAddress: Address,
  allowance: BigInt,
) => {
  return encodeFunctionData({
    abi: EIP20Abis,
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
