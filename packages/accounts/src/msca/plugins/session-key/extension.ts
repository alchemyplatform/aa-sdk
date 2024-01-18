import type {
  Address,
  ISmartAccountProvider,
  SupportedTransports,
} from "@alchemy/aa-core";
import type { IMSCA } from "../../types.js";
import { type Plugin } from "../types.js";
import { SessionKeyPlugin, SessionKeyPluginAbi } from "./plugin.js";
import { buildSessionKeysToRemoveStruct } from "./utils.js";

const ExtendedSessionKeyPlugin_ = {
  ...SessionKeyPlugin,
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

      updateAccountSessionKeys: async ({
        keysToAdd,
        keysToRemoves,
      }: {
        keysToAdd?: Address[];
        keysToRemoves?: Address[];
      }) => {
        const sessionKeysToRemove =
          keysToRemoves === undefined
            ? []
            : await buildSessionKeysToRemoveStruct(provider, keysToRemoves);
        return generated.updateSessionKeys({
          args: [keysToAdd ?? [], sessionKeysToRemove],
        });
      },

      addAccountSessionKeys: ({ keys }: { keys: Address[] }) => {
        return generated.updateSessionKeys({ args: [keys, []] });
      },

      removeAccountSessionKeys: async ({ keys }: { keys: Address[] }) => {
        const sessionKeysToRemove = await buildSessionKeysToRemoveStruct(
          provider,
          keys
        );
        return generated.updateSessionKeys({ args: [[], sessionKeysToRemove] });
      },

      clearAccountSessionKeys: async () => {
        const contract = SessionKeyPlugin.getContract(provider);
        const sessionKeys = await contract.read.getSessionKeys({
          account: await provider.account.getAddress(),
        });
        const sessionKeysToRemove = await buildSessionKeysToRemoveStruct(
          provider,
          sessionKeys
        );
        return generated.updateSessionKeys({ args: [[], sessionKeysToRemove] });
      },

      isAccountSessionKey: async ({ key }: { key: Address }) => {
        const contract = SessionKeyPlugin.getContract(provider);
        const isSessionKey = await contract.read.isSessionKey([key], {
          account: await provider.account.getAddress(),
        });
        return isSessionKey;
      },
    };
  },
};

export const ExtendedSessionKeyPlugin: Plugin<
  ReturnType<(typeof ExtendedSessionKeyPlugin_)["accountMethods"]>,
  ReturnType<(typeof ExtendedSessionKeyPlugin_)["providerMethods"]>,
  typeof SessionKeyPluginAbi
> = ExtendedSessionKeyPlugin_;
