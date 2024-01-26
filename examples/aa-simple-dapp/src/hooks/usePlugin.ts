import {
  UninstallPluginParams,
  accountLoupeDecorators,
  pluginManagerDecorator,
  type IMSCA,
  type Plugin
} from "@alchemy/aa-accounts";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { Address, UserOperationOverrides } from "@alchemy/aa-core";
import { useCallback, useMemo } from "react";
import { Abi } from "viem";

export const usePlugin = <AD, PD, TAbi extends Abi>(
  provider: AlchemyProvider,
  plugin: Plugin<AD, PD, TAbi>,
  pluginAddressOverride?: Address,
)  => {
  if (!provider.isConnected<IMSCA<any, any>>()) {
    return null;
  }

  const {
    accountMethods,
    providerMethods,
    meta: { addresses },
  } = plugin;

  const pluginAddress = useMemo(() => pluginAddressOverride ?? addresses[provider.rpcClient.chain.id], [pluginAddressOverride, addresses, provider]);

  const { uninstallPlugin: uninstallPlugin_ } =
    useMemo(() => pluginManagerDecorator(provider), [provider]);

  const uninstallPlugin = useCallback(
    async (
      params: Partial<UninstallPluginParams>,
      overrides?: UserOperationOverrides
    ) => {
      return uninstallPlugin_({ ...params, pluginAddress }, overrides);
    },
    [uninstallPlugin_, pluginAddress]
  );

  const isPluginInstalled = useCallback(async () => {
    const { getInstalledPlugins } = accountLoupeDecorators(provider.account);
    const plugins = await getInstalledPlugins();
    return plugins.some((p) => p === pluginAddress);
  }, [pluginAddress, provider.account]);

  return {
    pluginAddress,
    ...accountMethods(provider.account),
    ...providerMethods(provider),
    uninstallPlugin,
    isPluginInstalled,
  };
};
