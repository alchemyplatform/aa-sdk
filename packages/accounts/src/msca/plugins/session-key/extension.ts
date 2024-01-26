import type {
  ISmartAccountProvider,
  SupportedTransports,
  UserOperationOverrides,
} from "@alchemy/aa-core";
import type { Address } from "viem";
import type { IMSCA } from "../../types.js";
import { type Plugin } from "../types.js";
import { SessionKeyPlugin, SessionKeyPluginAbi } from "./plugin.js";
import { buildSessionKeysToRemoveStruct } from "./utils.js";

const ExtendedSessionKeyPlugin_ = {
  ...SessionKeyPlugin,
  accountMethods: (account: IMSCA<any, any, any>) => ({
    isAccountSessionKey: async ({
      key,
      pluginAddress,
    }: {
      key: Address;
      pluginAddress?: Address;
    }) => {
      const contract = SessionKeyPlugin.getContract(
        account.rpcProvider,
        pluginAddress
      );

      return await contract.read.isSessionKeyOf([
        await account.getAddress(),
        key,
      ]);
    },

    getAccountSessionKeys: async ({
      pluginAddress,
    }: {
      pluginAddress?: Address;
    }) => {
      const contract = SessionKeyPlugin.getContract(
        account.rpcProvider,
        pluginAddress
      );

      return await contract.read.sessionKeysOf([await account.getAddress()]);
    },
  }),
  providerMethods: <
    TTransport extends SupportedTransports,
    P extends ISmartAccountProvider<TTransport> & {
      account: IMSCA<TTransport>;
    }
  >(
    provider: P
  ) => {
    const generated = SessionKeyPlugin.providerMethods(provider);
    return {
      ...generated,

      removeAccountSessionKey: async (
        { key }: { key: Address },
        overrides?: UserOperationOverrides
      ) => {
        const sessionKeysToRemove = await buildSessionKeysToRemoveStruct(
          provider,
          [key]
        );
        return generated.removeSessionKey(
          { args: [key, sessionKeysToRemove[0].predecessor] },
          overrides
        );
      },
    };
  },
};

export const ExtendedSessionKeyPlugin: Plugin<
  ReturnType<(typeof ExtendedSessionKeyPlugin_)["accountMethods"]>,
  ReturnType<(typeof ExtendedSessionKeyPlugin_)["providerMethods"]>,
  typeof SessionKeyPluginAbi
> = ExtendedSessionKeyPlugin_;
