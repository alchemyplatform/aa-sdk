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
import { AccountVersionRegistry as lightAccountVersionRegistry } from "./utils.js";
import { LightAccountAbi_v2 } from "./abis/LightAccountAbi_v2.js";
import { LightAccountFactoryAbi_v2 } from "./abis/LightAccountFactoryAbi_v2.js";
import { MultiOwnerLightAccountAbi } from "./abis/MultiOwnerLightAccountAbi.js";
import { MultiOwnerLightAccountFactoryAbi } from "./abis/MultiOwnerLightAccountFactoryAbi.js";

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
  accountImplementation:
    lightAccountVersionRegistry.LightAccount["v1.0.1"].addresses.default.impl,
  factoryAddress:
    lightAccountVersionRegistry.LightAccount["v1.0.1"].addresses.default
      .factory,
  predictAccountAddress: (factoryArgs) => {
    return predictLightAccountAddress({
      factoryAddress:
        lightAccountVersionRegistry.LightAccount["v1.0.1"].addresses.default
          .factory,
      salt: factoryArgs.salt,
      ownerAddress: factoryArgs.owner,
      version: "v1.0.1",
    });
  },
};

export const lightAccountStaticImplV1_0_2: LightAccountV1StaticImpl = {
  ...lightAccountV1Base,
  accountImplementation:
    lightAccountVersionRegistry.LightAccount["v1.0.2"].addresses.default.impl,
  factoryAddress:
    lightAccountVersionRegistry.LightAccount["v1.0.2"].addresses.default
      .factory,
  predictAccountAddress: (factoryArgs) => {
    return predictLightAccountAddress({
      factoryAddress:
        lightAccountVersionRegistry.LightAccount["v1.0.2"].addresses.default
          .factory,
      salt: factoryArgs.salt,
      ownerAddress: factoryArgs.owner,
      version: "v1.0.2",
    });
  },
};

export const lightAccountStaticImplV1_1_0: LightAccountV1StaticImpl = {
  ...lightAccountV1Base,
  accountImplementation:
    lightAccountVersionRegistry.LightAccount["v1.1.0"].addresses.default.impl,
  factoryAddress:
    lightAccountVersionRegistry.LightAccount["v1.1.0"].addresses.default
      .factory,
  predictAccountAddress: (factoryArgs) => {
    return predictLightAccountAddress({
      factoryAddress:
        lightAccountVersionRegistry.LightAccount["v1.1.0"].addresses.default
          .factory,
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
  accountImplementation:
    lightAccountVersionRegistry.LightAccount["v2.0.0"].addresses.default.impl,
  factoryAbi: LightAccountFactoryAbi_v2,
  factoryAddress:
    lightAccountVersionRegistry.LightAccount["v2.0.0"].addresses.default
      .factory,
  getFactoryData: (factoryArgs) => {
    return encodeFunctionData({
      abi: LightAccountFactoryAbi_v2,
      functionName: "createAccount",
      args: [factoryArgs.owner, factoryArgs.salt],
    });
  },
  predictAccountAddress: (factoryArgs) => {
    return predictLightAccountAddress({
      factoryAddress:
        lightAccountVersionRegistry.LightAccount["v2.0.0"].addresses.default
          .factory,
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
  accountImplementation:
    lightAccountVersionRegistry.MultiOwnerLightAccount["v2.0.0"].addresses
      .default.impl,
  factoryAbi: MultiOwnerLightAccountFactoryAbi,
  factoryAddress:
    lightAccountVersionRegistry.MultiOwnerLightAccount["v2.0.0"].addresses
      .default.factory,
  getFactoryData: (factoryArgs) => {
    return encodeFunctionData({
      abi: MultiOwnerLightAccountFactoryAbi,
      functionName: "createAccount",
      args: [factoryArgs.owners, factoryArgs.salt],
    });
  },
  predictAccountAddress: (factoryArgs) => {
    return predictMultiOwnerLightAccountAddress({
      factoryAddress:
        lightAccountVersionRegistry.MultiOwnerLightAccount["v2.0.0"].addresses
          .default.factory,
      salt: factoryArgs.salt,
      ownerAddresses: factoryArgs.owners,
    });
  },
};
