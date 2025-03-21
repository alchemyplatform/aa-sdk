import type { Chain, Address } from "viem";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonAmoy,
  sepolia,
} from "@account-kit/infra";

export enum SignatureType {
  EOA = "0x00",
  CONTRACT = "0x01",
}

/**
 * Maps a given chain to a specific address of the webauthn validation module by its chain ID. If no direct mapping exists, it defaults to returning a specific address.
 *
 * @example
 * ```ts
 * import { getDefaultWebauthnValidationModuleAddress } from "@account-kit/smart-contracts";
 * import { Chain, Address } from "viem";
 *
 * const chain: Chain = ...
 * const webauthnValidationAddress: Address = getDefaultWebauthnValidationModuleAddress(chain);
 * ```
 * @param {Chain} chain The chain object containing the chain ID to map
 * @returns {Address} The webauthn validation module address associated with the specified chain ID or a default address if no specific mapping exists
 */
export const getDefaultWebauthnValidationModuleAddress = (
  chain: Chain
): Address => {
  switch (chain.id) {
    // TODO: case mekong.id:
    case sepolia.id:
    case baseSepolia.id:
    case polygon.id:
    case mainnet.id:
    case polygonAmoy.id:
    case optimism.id:
    case optimismSepolia.id:
    case arbitrum.id:
    case arbitrumSepolia.id:
    case base.id:
    default:
      return "0x0000000000001D9d34E07D9834274dF9ae575217";
  }
};

/**
 * Maps a given chain to a specific address of the time range module by its chain ID. If no direct mapping exists, it defaults to returning a specific address.
 *
 * @example
 * ```ts
 * import { getDefaultTimeRangeModuleAddress } from "@account-kit/smart-contracts";
 * import { Chain, Address } from "viem";
 *
 * const chain: Chain = ...
 * const timeRangeModuleAddress: Address = getDefaultTimeRangeModuleAddress(chain);
 * ```
 * @param {Chain} chain The chain object containing the chain ID to map
 * @returns {Address} The time range module address associated with the specified chain ID or a default address if no specific mapping exists
 */
export const getDefaultTimeRangeModuleAddress = (chain: Chain): Address => {
  switch (chain.id) {
    // TODO: case mekong.id:
    case sepolia.id:
    case baseSepolia.id:
    case polygon.id:
    case mainnet.id:
    case polygonAmoy.id:
    case optimism.id:
    case optimismSepolia.id:
    case arbitrum.id:
    case arbitrumSepolia.id:
    case base.id:
    default:
      return "0x00000000000082B8e2012be914dFA4f62A0573eA";
  }
};

/**
 * Maps a given chain to a specific address of the single signer validation module by its chain ID. If no direct mapping exists, it defaults to returning a specific address.
 *
 * @example
 * ```ts
 * import { getDefaultSingleSignerValidationModuleAddress } from "@account-kit/smart-contracts";
 * import { Chain, Address } from "viem";
 *
 * const chain: Chain = ...
 * const singleSignerValidationAddress: Address = getDefaultSingleSignerValidationModuleAddress(chain);
 * ```
 * @param {Chain} chain The chain object containing the chain ID to map
 * @returns {Address} The single signer validation module address associated with the specified chain ID or a default address if no specific mapping exists
 */
export const getDefaultSingleSignerValidationModuleAddress = (
  chain: Chain
): Address => {
  switch (chain.id) {
    // TODO: case mekong.id:
    case sepolia.id:
    case baseSepolia.id:
    case polygon.id:
    case mainnet.id:
    case polygonAmoy.id:
    case optimism.id:
    case optimismSepolia.id:
    case arbitrum.id:
    case arbitrumSepolia.id:
    case base.id:
    default:
      return "0x00000000000099DE0BF6fA90dEB851E2A2df7d83";
  }
};

/**
 * Maps a given chain to a specific address of the paymaster guard module by its chain ID. If no direct mapping exists, it defaults to returning a specific address.
 *
 * @example
 * ```ts
 * import { getDefaultPaymasterGuardModuleAddress } from "@account-kit/smart-contracts";
 * import { Chain, Address } from "viem";
 *
 * const chain: Chain = ...
 * const paymasterGuardAddress: Address = getDefaultPaymasterGuardModuleAddress(chain);
 * ```
 * @param {Chain} chain The chain object containing the chain ID to map
 * @returns {Address} The paymaster guard module address associated with the specified chain ID or a default address if no specific mapping exists
 */
export const getDefaultPaymasterGuardModuleAddress = (
  chain: Chain
): Address => {
  switch (chain.id) {
    // TODO: case mekong.id:
    case sepolia.id:
    case baseSepolia.id:
    case polygon.id:
    case mainnet.id:
    case polygonAmoy.id:
    case optimism.id:
    case optimismSepolia.id:
    case arbitrum.id:
    case arbitrumSepolia.id:
    case base.id:
    default:
      return "0x0000000000001aA7A7F7E29abe0be06c72FD42A1";
  }
};

/**
 * Maps a given chain to a specific address of the native token limit module by its chain ID. If no direct mapping exists, it defaults to returning a specific address.
 *
 * @example
 * ```ts
 * import { getDefaultNativeTokenLimitModuleAddress } from "@account-kit/smart-contracts";
 * import { Chain, Address } from "viem";
 *
 * const chain: Chain = ...
 * const nativeTokenLimitAddress: Address = getDefaultNativeTokenLimitModuleAddress(chain);
 * ```
 * @param {Chain} chain The chain object containing the chain ID to map
 * @returns {Address} The native token limit module address associated with the specified chain ID or a default address if no specific mapping exists
 */
export const getDefaultNativeTokenLimitModuleAddress = (
  chain: Chain
): Address => {
  switch (chain.id) {
    // TODO: case mekong.id:
    case sepolia.id:
    case baseSepolia.id:
    case polygon.id:
    case mainnet.id:
    case polygonAmoy.id:
    case optimism.id:
    case optimismSepolia.id:
    case arbitrum.id:
    case arbitrumSepolia.id:
    case base.id:
    default:
      return "0x00000000000001e541f0D090868FBe24b59Fbe06";
  }
};

/**
 * Maps a given chain to a specific address of the allowlist module by its chain ID. If no direct mapping exists, it defaults to returning a specific address.
 *
 * @example
 * ```ts
 * import { getDefaultAllowlistModuleAddress } from "@account-kit/smart-contracts";
 * import { Chain, Address } from "viem";
 *
 * const chain: Chain = ...
 * const allowlistModule: Address = getDefaultAllowlistModuleAddress(chain);
 * ```
 * @param {Chain} chain The chain object containing the chain ID to map
 * @returns {Address} The allowlist module address associated with the specified chain ID or a default address if no specific mapping exists
 */
export const getDefaultAllowlistModuleAddress = (chain: Chain): Address => {
  switch (chain.id) {
    // TODO: case mekong.id:
    case sepolia.id:
    case baseSepolia.id:
    case polygon.id:
    case mainnet.id:
    case polygonAmoy.id:
    case optimism.id:
    case optimismSepolia.id:
    case arbitrum.id:
    case arbitrumSepolia.id:
    case base.id:
    default:
      return "0x0000000000002311EEE9A2B887af1F144dbb4F6e";
  }
};
