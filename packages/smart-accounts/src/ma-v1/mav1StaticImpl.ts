import { type Address } from "viem";
import { entryPoint06Abi, entryPoint06Address } from "viem/account-abstraction";
import { MultiOwnerLightAccountAbi } from "../light-account/abis/MultiOwnerLightAccountAbi.js";
import { MultiOwnerLightAccountFactoryAbi } from "../light-account/abis/MultiOwnerLightAccountFactoryAbi.js";
import { lowerAddress } from "@alchemy/common";
import type { StaticSmartAccountImplementation } from "../types";
import { LightAccountAbi_v1 } from "../light-account/abis/LightAccountAbi_v1.js";
import { LightAccountFactoryAbi_v1 } from "../light-account/abis/LightAccountFactoryAbi_v1.js";

export type MultiOwnerModularAccountV1FactoryArgs = {
  owners: Address[];
  salt: bigint;
};

export const multiOwnerLightAccountStaticImplV2_0_0: StaticSmartAccountImplementation<
  false,
  "0.6",
  MultiOwnerModularAccountV1FactoryArgs, // TODO(jh): where is this defined?
  typeof entryPoint06Abi,
  typeof MultiOwnerLightAccountAbi, // TODO(jh): replace w/ correct MAv1 abi.
  typeof MultiOwnerLightAccountFactoryAbi // TODO(jh): replace w/ correct MAv1 factory abi.
> = {
  entryPoint: {
    abi: entryPoint06Abi,
    address: entryPoint06Address,
    version: "0.6",
  },
  accountAbi: LightAccountAbi_v1, // TODO(jh): replace w/ correct MAv1 abi.
  factoryAbi: LightAccountFactoryAbi_v1, // TODO(jh): replace w/ correct MAv1 factory abi.
  getFactoryData: (factoryArgs: MultiOwnerModularAccountV1FactoryArgs) => {
    throw new Error("Not implemented yet"); // TODO(jh): impl
  },
  accountAbi: MultiOwnerLightAccountAbi, // TODO(jh): replace w/ correct MAv1 abi.
  accountImplementation: lowerAddress(
    "0xd2c27F9eE8E4355f71915ffD5568cB3433b6823D", // TODO(jh): replace w/ correct MAv1 multi-owner implementation address.
  ),
  factoryAbi: MultiOwnerLightAccountFactoryAbi, // TODO(jh): replace w/ correct MAv1 factory abi.
  factoryAddress: lowerAddress("0x000000000019d2Ee9F2729A65AfE20bb0020AefC"), // TODO(jh): replace w/ correct MAv1 multi-owner factory address.
  getFactoryData: (factoryArgs) => {
    throw new Error("Not implemented yet"); // TODO(jh): impl
  },
  predictAccountAddress: (factoryArgs) => {
    throw new Error("Not implemented yet"); // TODO(jh): impl
  },
};
