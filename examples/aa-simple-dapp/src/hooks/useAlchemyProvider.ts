import { chain, gasManagerPolicyId } from "@/config/client";
import { getRpcUrl } from "@/config/rpc";
import {
  MSCA,
  MultiOwnerPlugin,
  SessionKeyPlugin,
  createMultiOwnerMSCA,
  encodeFunctionReference,
  getDefaultMultiOwnerMSCAFactoryAddress,
  installPlugin,
} from "@alchemy/aa-accounts";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  SmartAccountSigner,
  getDefaultEntryPointAddress,
} from "@alchemy/aa-core";
import { useCallback, useState } from "react";
import { Address, encodeAbiParameters, parseAbiParameters } from "viem";

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
            factoryAddress: getDefaultMultiOwnerMSCAFactoryAddress(chain),
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

  const pluginInstall = useCallback(
    async (type: PluginType) => {
      if (!provider.isConnected<MSCA>()) {
        return;
      }

      switch (type) {
        case PluginType.SESSION_KEY:
          return installPlugin(provider, {
            pluginAddress: SessionKeyPlugin.meta.address[chain.id],
            pluginInitData: encodeAbiParameters(
              parseAbiParameters("address[]"),
              [[]]
            ),
            dependencies: [
              encodeFunctionReference(
                MultiOwnerPlugin.meta.address[chain.id],
                "0x0"
              ),
              encodeFunctionReference(
                MultiOwnerPlugin.meta.address[chain.id],
                "0x1"
              ),
            ],
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
