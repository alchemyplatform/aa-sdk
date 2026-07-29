import { encodeFunctionData, type Address } from "viem";
import { entryPoint07Abi, entryPoint07Address } from "viem/account-abstraction";
import { lowerAddress } from "@alchemy/common";
import type { StaticSmartAccountImplementation } from "../types.js";
import { semiModularAccountBytecodeAbi } from "./abis/semiModularAccountBytecodeAbi.js";
import { accountFactoryAbi } from "./abis/accountFactoryAbi.js";
import {
  DEFAULT_SEMI_MODULAR_ACCOUNT_7702_VERSION,
  DefaultAddress as DefaultMAV2Address,
  SemiModularAccount7702Address,
  type SemiModularAccount7702Version,
} from "./utils/account.js";
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
 * Static implementation logic for SemiModularAccount7702 v1.0.0.
 */
export const semiModularAccount7702StaticImplV1_0_0: SemiModularAccount7702StaticImpl =
  {
    ...semiModularAccountBase,
    delegationAddress: lowerAddress(SemiModularAccount7702Address["v1.0.0"]),
  };

/**
 * Static implementation logic for SemiModularAccount7702 v1.1.0, which also
 * accepts bare ECDSA signatures from the delegating EOA for ERC-1271 checks.
 */
export const semiModularAccount7702StaticImplV1_1_0: SemiModularAccount7702StaticImpl =
  {
    ...semiModularAccountBase,
    delegationAddress: lowerAddress(SemiModularAccount7702Address["v1.1.0"]),
  };

/**
 * Static implementation logic for each released version of
 * SemiModularAccount7702, keyed by version.
 */
export const SemiModularAccount7702VersionRegistry = {
  "v1.0.0": semiModularAccount7702StaticImplV1_0_0,
  "v1.1.0": semiModularAccount7702StaticImplV1_1_0,
} satisfies Record<
  SemiModularAccount7702Version,
  SemiModularAccount7702StaticImpl
>;

/**
 * Static implementation logic for SemiModularAccount7702, at the default
 * version.
 */
export const semiModularAccount7702StaticImpl: SemiModularAccount7702StaticImpl =
  SemiModularAccount7702VersionRegistry[
    DEFAULT_SEMI_MODULAR_ACCOUNT_7702_VERSION
  ];
