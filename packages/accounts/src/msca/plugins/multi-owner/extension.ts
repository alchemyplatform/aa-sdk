import { type Address } from "viem";
import type { IMSCA } from "../../types.js";
import type { Plugin } from "../types.js";
import { MultiOwnerPlugin, MultiOwnerPluginAbi } from "./plugin.js";

const ExtendedMultiOwnerPlugin_ = {
  ...MultiOwnerPlugin,
  accountMethods: (account: IMSCA<any, any, any>) => {
    const og = MultiOwnerPlugin.accountMethods(account);
    return {
      ...og,
      readOwners: async (pluginAddress?: Address) => {
        // TODO: check if the account actually has the plugin installed
        // either via account loupe or checking if the supports interface call passes on the account
        const contract = MultiOwnerPlugin.getContract(
          account.rpcProvider,
          pluginAddress
        );
        return contract.read.ownersOf([await account.getAddress()]);
      },
    };
  },
};

export const ExtendedMultiOwnerPlugin: Plugin<
  ReturnType<(typeof ExtendedMultiOwnerPlugin_)["accountMethods"]>,
  ReturnType<(typeof ExtendedMultiOwnerPlugin_)["providerMethods"]>,
  typeof MultiOwnerPluginAbi
> = ExtendedMultiOwnerPlugin_;
