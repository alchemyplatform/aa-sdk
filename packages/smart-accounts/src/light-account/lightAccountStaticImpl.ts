import { encodeFunctionData, type Address } from "viem";
import {
  entryPoint06Abi,
  entryPoint07Abi,
  entryPoint06Address,
  entryPoint07Address,
} from "viem/account-abstraction";
import { LightAccountAbi_v1 } from "./abis/LightAccountAbi_v1.js";
import { LightAccountFactoryAbi_v1 } from "./abis/LightAccountFactoryAbi_v1.js";

import type { StaticSmartAccountImplementation } from "../types.js";
import {
  predictLightAccountAddress,
  predictMultiOwnerLightAccountAddress,
} from "./predictAddress.js";
import { LightAccountAbi_v2 } from "./abis/LightAccountAbi_v2.js";
import { LightAccountFactoryAbi_v2 } from "./abis/LightAccountFactoryAbi_v2.js";
import { MultiOwnerLightAccountAbi } from "./abis/MultiOwnerLightAccountAbi.js";
import { MultiOwnerLightAccountFactoryAbi } from "./abis/MultiOwnerLightAccountFactoryAbi.js";
import { lowerAddress } from "@alchemy/common";

export type LightAccountFactoryArgs = {
  owner: Address;
  salt: bigint;
};

// Shared type and fields for all light account v1 implementations
type LightAccountV1StaticImpl = StaticSmartAccountImplementation<
  false,
  "0.6",
  LightAccountFactoryArgs,
  typeof entryPoint06Abi,
  typeof LightAccountAbi_v1,
  typeof LightAccountFactoryAbi_v1
>;

const lightAccountV1Base = {
  entryPoint: {
    abi: entryPoint06Abi,
    address: entryPoint06Address,
    version: "0.6",
  },
  accountAbi: LightAccountAbi_v1,
  factoryAbi: LightAccountFactoryAbi_v1,
  getFactoryData: (factoryArgs: LightAccountFactoryArgs) => {
    return encodeFunctionData({
      abi: LightAccountFactoryAbi_v1,
      functionName: "createAccount",
      args: [factoryArgs.owner, factoryArgs.salt],
    });
  },
} satisfies Partial<LightAccountV1StaticImpl>;

export const lightAccountStaticImplV1_0_1: LightAccountV1StaticImpl = {
  ...lightAccountV1Base,
  factoryAddress: lowerAddress("0x000000893A26168158fbeaDD9335Be5bC96592E2"),
  accountImplementation: lowerAddress(
    "0xc1b2fc4197c9187853243e6e4eb5a4af8879a1c0",
  ),
  predictAccountAddress: (factoryArgs) => {
    return predictLightAccountAddress({
      salt: factoryArgs.salt,
      ownerAddress: factoryArgs.owner,
      version: "v1.0.1",
    });
  },
};

export const lightAccountStaticImplV1_0_2: LightAccountV1StaticImpl = {
  ...lightAccountV1Base,
  accountImplementation: lowerAddress(
    "0x5467b1947F47d0646704EB801E075e72aeAe8113",
  ),
  factoryAddress: lowerAddress("0x00000055C0b4fA41dde26A74435ff03692292FBD"),
  predictAccountAddress: (factoryArgs) => {
    return predictLightAccountAddress({
      salt: factoryArgs.salt,
      ownerAddress: factoryArgs.owner,
      version: "v1.0.2",
    });
  },
};

export const lightAccountStaticImplV1_1_0: LightAccountV1StaticImpl = {
  ...lightAccountV1Base,
  accountImplementation: lowerAddress(
    "0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba",
  ),
  factoryAddress: lowerAddress("0x00004EC70002a32400f8ae005A26081065620D20"),
  predictAccountAddress: (factoryArgs) => {
    return predictLightAccountAddress({
      salt: factoryArgs.salt,
      ownerAddress: factoryArgs.owner,
      version: "v1.1.0",
    });
  },
};

// Shared type and fields for all light account v2 implementations
const lightAccountV2Base = {
  entryPoint: {
    abi: entryPoint07Abi,
    address: entryPoint07Address,
    version: "0.7",
  },
} satisfies Partial<StaticSmartAccountImplementation<false, "0.7">>;

export const lightAccountStaticImplV2_0_0: StaticSmartAccountImplementation<
  false,
  "0.7",
  LightAccountFactoryArgs,
  typeof entryPoint07Abi,
  typeof LightAccountAbi_v2,
  typeof LightAccountFactoryAbi_v2
> = {
  ...lightAccountV2Base,
  accountAbi: LightAccountAbi_v2,
  accountImplementation: lowerAddress(
    "0x8E8e658E22B12ada97B402fF0b044D6A325013C7",
  ),
  factoryAbi: LightAccountFactoryAbi_v2,
  factoryAddress: lowerAddress("0x0000000000400CdFef5E2714E63d8040b700BC24"),
  getFactoryData: (factoryArgs) => {
    return encodeFunctionData({
      abi: LightAccountFactoryAbi_v2,
      functionName: "createAccount",
      args: [factoryArgs.owner, factoryArgs.salt],
    });
  },
  predictAccountAddress: (factoryArgs) => {
    return predictLightAccountAddress({
      salt: factoryArgs.salt,
      ownerAddress: factoryArgs.owner,
      version: "v2.0.0",
    });
  },
};

export type MultiOwnerLightAccountFactoryArgs = {
  owners: Address[];
  salt: bigint;
};

export const multiOwnerLightAccountStaticImplV2_0_0: StaticSmartAccountImplementation<
  false,
  "0.7",
  MultiOwnerLightAccountFactoryArgs,
  typeof entryPoint07Abi,
  typeof MultiOwnerLightAccountAbi,
  typeof MultiOwnerLightAccountFactoryAbi
> = {
  ...lightAccountV2Base,
  accountAbi: MultiOwnerLightAccountAbi,
  accountImplementation: lowerAddress(
    "0xd2c27F9eE8E4355f71915ffD5568cB3433b6823D",
  ),
  factoryAbi: MultiOwnerLightAccountFactoryAbi,
  factoryAddress: lowerAddress("0x000000000019d2Ee9F2729A65AfE20bb0020AefC"),
  getFactoryData: (factoryArgs) => {
    return encodeFunctionData({
      abi: MultiOwnerLightAccountFactoryAbi,
      functionName: "createAccount",
      args: [factoryArgs.owners, factoryArgs.salt],
    });
  },
  predictAccountAddress: (factoryArgs) => {
    return predictMultiOwnerLightAccountAddress({
      salt: factoryArgs.salt,
      ownerAddresses: factoryArgs.owners,
    });
  },
};
