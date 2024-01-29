import { chain } from "@/config/client";
import {
  MultiOwnerPlugin,
  SessionKeyPlugin,
  TokenReceiverPlugin,
  installPlugin,
  uninstallPlugin
} from "@alchemy/aa-accounts";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { useCallback, useEffect, useState } from "react";
import { Address } from "viem";
import { UsePluginReturn, usePlugin } from "./usePlugin";

export enum PluginType {
  MultiOwnerPlugin,
  SessionKeyPlugin,
  TokenReceiverPlugin
}

export const useAccountPlugins = ({
  provider,
  pluginAddressOverrides
}: {
  provider: AlchemyProvider;
  pluginAddressOverrides?: Record<PluginType, Address>
}) => {
  const multiOwnerPlugin = usePlugin(provider, MultiOwnerPlugin, pluginAddressOverrides?.[PluginType.MultiOwnerPlugin]);
  const sessionKeyPlugin = usePlugin(provider, SessionKeyPlugin, pluginAddressOverrides?.[PluginType.SessionKeyPlugin]);
  const tokenReceiverPlugin = usePlugin(provider, TokenReceiverPlugin, pluginAddressOverrides?.[PluginType.TokenReceiverPlugin]);

  const [installedPlugins, setInstalledPlugins] = useState<
    UsePluginReturn<any, any>[]
  >([]);

  const getInstalledPlugins = useCallback(
    async () =>
      [multiOwnerPlugin, sessionKeyPlugin, tokenReceiverPlugin].filter(
        async (plugin) => await plugin?.isPluginInstalled()
      ),
    [multiOwnerPlugin, sessionKeyPlugin, tokenReceiverPlugin]
  );

  useEffect(() => {
    getInstalledPlugins().then((plugins) => {
      setInstalledPlugins(plugins);
    });
  }, [getInstalledPlugins]);

  const pluginInstall = useCallback(
    async (pluginType: PluginType) => {
     switch (pluginType) {
      case PluginType.MultiOwnerPlugin:
      break
      case PluginType.SessionKeyPlugin:
      break
      case PluginType.TokenReceiverPlugin:
      break
     }
    },
    [provider]
  );

  const pluginUninstall = useCallback(
    async (type: PluginType) => {
      if (!provider.isConnected<MSCA>()) {
        return;
      }

      switch (type) {
        case PluginType.SESSION_KEY:
          return uninstallPlugin(provider, {
            pluginAddress: SessionKeyPlugin.meta.addresses[chain.id],
          });
        case PluginType.TOKEN_RECEIVER:
          return uninstallPlugin(provider, {
            pluginAddress: TokenReceiverPlugin.meta.addresses[chain.id],
          });
        default:
          throw new Error("Unexpected plugin type", { cause: type });
      }
    },
    [provider]
  );

  return {
    availablePlugins,
    installedPlugins,
    installPlugin,
    uninstallPlugin,
  };
};
