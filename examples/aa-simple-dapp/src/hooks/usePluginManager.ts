import { chain } from "@/config/client";
import {
  IAccountLoupe,
  MSCA,
  MultiOwnerPlugin,
  SessionKeyPlugin,
  TokenReceiverPlugin,
  installPlugin as aaInstallPlugin,
  uninstallPlugin as aaUninstallPlugin,
  encodeFunctionReference,
} from "@alchemy/aa-accounts";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { useCallback, useMemo, useState } from "react";
import { Address, encodeAbiParameters, parseAbiParameters } from "viem";
import { useAsyncEffect } from "./useAsyncEffect";

export enum PluginType {
  MULTI_OWNER = "Multi Owner Plugin",
  TOKEN_RECEIVER = "Token Receiver Plugin",
  SESSION_KEY = "Session Key Plugin",
}

export const usePluginManager = ({
  scaAddress,
  provider,
}: {
  scaAddress: Address | undefined;
  provider: AlchemyProvider;
}) => {
  const [installedPlugins, setInstalledPlugins] = useState<
    ReadonlyArray<Address>
  >([]);

  const tokenReceiverEnabled = useMemo(
    () =>
      installedPlugins.includes(
        TokenReceiverPlugin.meta.addresses[provider.rpcClient.chain.id]
      ),
    [installedPlugins, provider.rpcClient.chain.id]
  );

  const sessionKeyEnabled = useMemo(
    () =>
      installedPlugins.includes(
        SessionKeyPlugin.meta.addresses[provider.rpcClient.chain.id]
      ),
    [installedPlugins, provider.rpcClient.chain.id]
  );

  const installPlugin = useCallback(
    async (type: PluginType, params?: any) => {
      if (scaAddress == null || !provider.isConnected<MSCA>()) {
        return;
      }

      switch (type) {
        case PluginType.SESSION_KEY:
          return aaInstallPlugin(provider, {
            pluginAddress: SessionKeyPlugin.meta.addresses[chain.id],
            pluginInitData: encodeAbiParameters(
              parseAbiParameters("address[]"),
              [params]
            ),
            dependencies: [
              encodeFunctionReference(
                MultiOwnerPlugin.meta.addresses[chain.id] as Address,
                "0x0"
              ),
              encodeFunctionReference(
                MultiOwnerPlugin.meta.addresses[chain.id] as Address,
                "0x1"
              ),
            ],
          });
        case PluginType.TOKEN_RECEIVER:
          return aaInstallPlugin(provider, {
            pluginAddress: TokenReceiverPlugin.meta.addresses[chain.id],
          });
        default:
          throw new Error("Unexpected plugin type", { cause: type });
      }
    },
    [provider, scaAddress]
  );

  const uninstallPlugin = useCallback(
    async (type: PluginType) => {
      if (scaAddress == null || !provider.isConnected<MSCA>()) {
        return;
      }

      switch (type) {
        case PluginType.SESSION_KEY:
          return aaUninstallPlugin(provider, {
            pluginAddress: SessionKeyPlugin.meta.addresses[chain.id],
          });
        case PluginType.TOKEN_RECEIVER:
          return aaUninstallPlugin(provider, {
            pluginAddress: TokenReceiverPlugin.meta.addresses[chain.id],
          });
        default:
          throw new Error("Unexpected plugin type", { cause: type });
      }
    },
    [provider, scaAddress]
  );

  const getInstalledPlugins = useCallback(async () => {
    if (scaAddress == null || !provider.isConnected<MSCA>()) {
      return;
    }
    return await (
      provider.account as MSCA & IAccountLoupe
    ).getInstalledPlugins();
  }, [provider, scaAddress]);

  const refetchInstalledPlugins = useCallback(
    async (_scaAddress: Address) => {
      if (scaAddress == null || !provider.isConnected<MSCA>()) {
        return;
      }
      const _installedPlugins = await getInstalledPlugins();
      if (_installedPlugins !== undefined) {
        setInstalledPlugins(_installedPlugins);
      }
    },
    [getInstalledPlugins, provider, scaAddress]
  );

  useAsyncEffect(async () => {
    if (scaAddress == null || !provider.isConnected<MSCA>()) {
      return;
    }
    refetchInstalledPlugins(await provider.getAddress());
  }, [provider, scaAddress]);

  return {
    tokenReceiverEnabled,
    sessionKeyEnabled,
    installedPlugins,
    installPlugin,
    uninstallPlugin,
    getInstalledPlugins,
    refetchInstalledPlugins,
  };
};
