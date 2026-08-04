import { encodeFunctionData, zeroAddress, type Address } from "viem";
import { entryPoint07Abi, entryPoint07Address } from "viem/account-abstraction";
import { lowerAddress } from "@alchemy/common";
import type { StaticSmartAccountImplementation } from "../types.js";
import { semiModularAccountBytecodeAbi } from "./abis/semiModularAccountBytecodeAbi.js";
import { accountFactoryAbi } from "./abis/accountFactoryAbi.js";
import { DefaultAddress as DefaultMAV2Address } from "./utils/account.js";
import { predictModularAccountV2Address } from "./predictAddress.js";

export type SemiModularAccountV2FactoryArgs = {
  owner: Address;
  salt: bigint;
};

export type SemiModularAccountV2StaticImpl = StaticSmartAccountImplementation<
  false,
  "0.7",
  SemiModularAccountV2FactoryArgs,
  typeof entryPoint07Abi,
  typeof semiModularAccountBytecodeAbi,
  typeof accountFactoryAbi
>;

/**
 * Stands in for the address of a contract that isn't deployed yet, so an
 * unreleased version can be registered before its deployment lands.
 *
 * `zeroAddress` rather than a plausible-looking address: it can't be mistaken
 * for a real deployment, and `isAddressEqual(addr, zeroAddress)` is how the
 * registry test finds these entries.
 */
export const PLACEHOLDER_DELEGATION_ADDRESS = zeroAddress;

// Shared entryPoint configuration across all modular account v2 implementations
const entryPoint = {
  abi: entryPoint07Abi,
  address: entryPoint07Address,
  version: "0.7",
} as const;

// Shared base for semi-modular account implementations (SMA and 7702)
const semiModularAccountBase = {
  entryPoint,
  accountAbi: semiModularAccountBytecodeAbi,
} satisfies Partial<SemiModularAccountV2StaticImpl>;

/**
 * Static implementation logic for SemiModularAccountV2.
 */
export const semiModularAccountV2StaticImpl: SemiModularAccountV2StaticImpl = {
  ...semiModularAccountBase,
  accountImplementation: lowerAddress(DefaultMAV2Address.SMAV2_BYTECODE),
  factoryAddress: lowerAddress(DefaultMAV2Address.MAV2_FACTORY),
  factoryAbi: accountFactoryAbi,
  getFactoryData: (args: SemiModularAccountV2FactoryArgs) => {
    return encodeFunctionData({
      abi: accountFactoryAbi,
      functionName: "createSemiModularAccount",
      args: [args.owner, args.salt],
    });
  },
  predictAccountAddress: (args: SemiModularAccountV2FactoryArgs) => {
    return predictModularAccountV2Address({
      factoryAddress: DefaultMAV2Address.MAV2_FACTORY,
      implementationAddress: DefaultMAV2Address.SMAV2_BYTECODE,
      type: "SMA",
      salt: args.salt,
      ownerAddress: args.owner,
    });
  },
};

export type SemiModularAccount7702StaticImpl = StaticSmartAccountImplementation<
  true,
  "0.7",
  SemiModularAccountV2FactoryArgs,
  typeof entryPoint07Abi,
  typeof semiModularAccountBytecodeAbi,
  typeof accountFactoryAbi
>;

/**
 * Static implementation logic for SemiModularAccount7702 v1.0.0
 * (`alchemy.sma-7702.1.0.0`).
 */
export const semiModularAccount7702StaticImplV1_0_0: SemiModularAccount7702StaticImpl =
  {
    ...semiModularAccountBase,
    delegationAddress: lowerAddress(DefaultMAV2Address.SMAV2_7702),
  };

/**
 * Static implementation logic for SemiModularAccount7702 v1.1.0-beta, which
 * fixes ERC-1271 for callers that go through Permit2, Seaport, or
 * OpenZeppelin's `SignatureChecker`.
 *
 * @remarks
 * **Experimental.** `delegationAddress` is
 * {@link PLACEHOLDER_DELEGATION_ADDRESS}, not a deployment — the contract isn't
 * live yet, so selecting this version delegates to an address with no code.
 * Both the address and the `"v1.1.0-beta"` key are subject to change or removal
 * without a major version bump; at GA the key becomes `"v1.1.0"` and beta
 * callers have to update.
 */
export const semiModularAccount7702StaticImplV1_1_0Beta: SemiModularAccount7702StaticImpl =
  {
    ...semiModularAccountBase,
    delegationAddress: PLACEHOLDER_DELEGATION_ADDRESS,
  };

/**
 * Static implementation logic for SemiModularAccount7702, at the default
 * version (`DEFAULT_SMAV2_7702_VERSION`).
 */
export const semiModularAccount7702StaticImpl: SemiModularAccount7702StaticImpl =
  semiModularAccount7702StaticImplV1_0_0;
