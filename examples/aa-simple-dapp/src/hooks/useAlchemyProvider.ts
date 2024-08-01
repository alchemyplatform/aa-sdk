import { chain, gasManagerPolicyId } from "@/config/client";
import { getRpcUrl } from "@/config/rpc";
import {
    IMSCA,
    SessionKeyPlugin,
    createMultiOwnerMSCA,
    getDefaultMultiOwnerModularAccountFactoryAddress,
} from "@alchemy/aa-accounts";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
    SmartAccountSigner,
    getDefaultEntryPointAddress,
} from "@alchemy/aa-core";
import { useCallback, useState } from "react";
import { Address } from "viem";
import { usePlugin } from "./usePlugin";

export enum PluginType {
  SESSION_KEY,
}

export const useAlchemyProvider = () => {
  const [provider, setProvider] = useState<AlchemyProvider>(
    new AlchemyProvider({
      chain,
      rpcUrl: getRpcUrl(),
    })
  );

  const connectProviderToAccount = useCallback(
    (signer: SmartAccountSigner, account?: Address) => {
      const connectedProvider = provider
        .connect((provider) => {
          return createMultiOwnerMSCA({
            rpcClient: provider,
            owner: signer,
            chain,
            entryPointAddress: getDefaultEntryPointAddress(chain),
            factoryAddress: getDefaultMultiOwnerModularAccountFactoryAddress(chain),
            accountAddress: account,
          });
        })
        .withAlchemyGasManager({
          policyId: gasManagerPolicyId,
        });

      setProvider(connectedProvider);
      return connectedProvider;
    },
    [provider]
  );

  const disconnectProviderFromAccount = useCallback(() => {
    const disconnectedProvider = provider.disconnect();

    setProvider(disconnectedProvider);
    return disconnectedProvider;
  }, [provider]);

  const sessionKeyPlugin = usePlugin(provider, SessionKeyPlugin);

  const pluginInstall = useCallback(
    async (type: PluginType) => {
      if (!provider.isConnected<IMSCA>()) {
        return;
      }

      switch (type) {
        case PluginType.SESSION_KEY:
          return sessionKeyPlugin?.installSessionKeyPlugin({
            args: [[]],
          });

        default:
          throw new Error("Unexpected plugin type", type);
      }
    },
    [provider]
  );

  return {
    provider,
    connectProviderToAccount,
    disconnectProviderFromAccount,
    pluginInstall,
  };
};
