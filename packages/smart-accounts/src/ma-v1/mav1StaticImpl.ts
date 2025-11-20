import { type Address, encodeFunctionData } from "viem";
import { entryPoint06Abi, entryPoint06Address } from "viem/account-abstraction";
import { lowerAddress } from "@alchemy/common";
import type { StaticSmartAccountImplementation } from "../types";
import { MultiOwnerModularAccountFactoryAbi } from "./abis/MultiOwnerModularAccountFactory.js";
import { UpgradeableModularAccountAbi } from "./abis/UpgradeableModularAccount.js";
import { DefaultMaV1Address } from "./account.js";
import { predictMultiOwnerModularAccountV1Address } from "./predictAddress.js";

export type MultiOwnerModularAccountV1FactoryArgs = {
  owners: Address[];
  salt: bigint;
};

/**
 * Static implementation logic for ModularAccountV1.
 *
 * TODO(v5): update JSDoc format when doc-gen supports structs or records.
 */
export const multiOwnerModularAccountStaticImpl: StaticSmartAccountImplementation<
  false,
  "0.6",
  MultiOwnerModularAccountV1FactoryArgs,
  typeof entryPoint06Abi,
  typeof UpgradeableModularAccountAbi,
  typeof MultiOwnerModularAccountFactoryAbi
> = {
  entryPoint: {
    abi: entryPoint06Abi,
    address: entryPoint06Address,
    version: "0.6",
  },
  accountAbi: UpgradeableModularAccountAbi, // TODO(jh): is this the correct abi?
  factoryAbi: MultiOwnerModularAccountFactoryAbi,
  getFactoryData: (factoryArgs: MultiOwnerModularAccountV1FactoryArgs) => {
    return encodeFunctionData({
      abi: MultiOwnerModularAccountFactoryAbi,
      functionName: "createAccount",
      args: [factoryArgs.salt, factoryArgs.owners],
    });
  },
  accountImplementation: lowerAddress(
    DefaultMaV1Address.IMPLEMENTATION_ADDRESS,
  ),
  factoryAddress: lowerAddress(DefaultMaV1Address.MULTI_OWNER_MAV1_FACTORY),
  predictAccountAddress: (args) => {
    return predictMultiOwnerModularAccountV1Address({
      salt: args.salt,
      ownerAddresses: args.owners,
      factoryAddress: DefaultMaV1Address.MULTI_OWNER_MAV1_FACTORY,
    });
  },
};
