import { encodeFunctionData, type Address, type Hex } from "viem";
import { entryPoint07Abi, entryPoint07Address } from "viem/account-abstraction";
import { lowerAddress } from "@alchemy/common";
import type { StaticSmartAccountImplementation } from "../types.js";
import { semiModularAccountBytecodeAbi } from "./abis/semiModularAccountBytecodeAbi.js";
import { accountFactoryAbi } from "./abis/accountFactoryAbi.js";
import { webAuthnFactoryAbi } from "./abis/webAuthnFactoryAbi.js";
import { DefaultAddress as DefaultMAV2Address } from "./utils/account.js";
import { predictModularAccountV2Address } from "./predictAddress.js";
import { modularAccountAbi } from "./abis/modularAccountAbi.js";
import { parsePublicKey } from "webauthn-p256";

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

export const semiModularAccount7702StaticImpl: SemiModularAccount7702StaticImpl =
  {
    ...semiModularAccountBase,
    delegationAddress: lowerAddress(DefaultMAV2Address.SMAV2_7702),
  };

export type WebAuthnModularAccountV2FactoryArgs = {
  ownerPublicKey: Hex;
  salt: bigint;
  entityId: number;
};

export type WebAuthnModularAccountV2StaticImpl =
  StaticSmartAccountImplementation<
    false,
    "0.7",
    WebAuthnModularAccountV2FactoryArgs,
    typeof entryPoint07Abi,
    typeof modularAccountAbi,
    typeof webAuthnFactoryAbi
  >;

export const webAuthnModularAccountV2StaticImpl: WebAuthnModularAccountV2StaticImpl =
  {
    entryPoint,
    accountAbi: modularAccountAbi,
    accountImplementation: lowerAddress(DefaultMAV2Address.MAV2),
    factoryAddress: lowerAddress(DefaultMAV2Address.MAV2_FACTORY_WEBAUTHN),
    factoryAbi: webAuthnFactoryAbi,
    getFactoryData: (args: WebAuthnModularAccountV2FactoryArgs) => {
      const { x, y } = parsePublicKey(args.ownerPublicKey);
      return encodeFunctionData({
        abi: webAuthnFactoryAbi,
        functionName: "createWebAuthnAccount",
        args: [x, y, args.salt, args.entityId],
      });
    },
    predictAccountAddress: (args: WebAuthnModularAccountV2FactoryArgs) => {
      return predictModularAccountV2Address({
        factoryAddress: DefaultMAV2Address.MAV2_FACTORY_WEBAUTHN,
        implementationAddress: DefaultMAV2Address.MAV2,
        type: "WebAuthn",
        salt: args.salt,
        ownerPublicKey: args.ownerPublicKey,
        entityId: args.entityId,
      });
    },
  };
