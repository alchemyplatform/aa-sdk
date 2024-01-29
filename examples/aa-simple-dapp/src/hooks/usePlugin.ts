import {
  IMSCA,
  UninstallPluginParams,
  accountLoupeDecorators,
  pluginManagerDecorator,
  type Plugin,
} from "@alchemy/aa-accounts";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  Address,
  SendUserOperationResult,
  UserOperationOverrides,
} from "@alchemy/aa-core";
import { useCallback, useMemo } from "react";
import { Abi } from "viem";
import { ZodUndefined, undefined } from "zod";

export type UsePluginReturn<AD, PD> =
  | {
      pluginAddress: Address;
      uninstallPlugin: (
        params: Partial<UninstallPluginParams>,
        overrides?: UserOperationOverrides
      ) => Promise<SendUserOperationResult | ZodUndefined>;
      isPluginInstalled: () => Promise<boolean>;
    } & (AD | {}) &
      (PD | {});

export const usePlugin = <AD, PD, TAbi extends Abi>(
  provider: AlchemyProvider,
  plugin: Plugin<AD, PD, TAbi>,
  pluginAddressOverride?: Address
): UsePluginReturn<AD, PD> => {
  const {
    accountMethods,
    providerMethods,
    meta: { addresses },
  } = plugin;

  const pluginAddress = useMemo(
    () => pluginAddressOverride ?? addresses[provider.rpcClient.chain.id],
    [pluginAddressOverride, addresses, provider]
  );

  const { uninstallPlugin: uninstallPlugin_ } = useMemo(
    () =>
      provider.isConnected<IMSCA<any, any>>()
        ? pluginManagerDecorator(provider)
        : { uninstallPlugin: undefined },
    [provider]
  );

  const uninstallPlugin = useCallback(
    async (
      params: Partial<UninstallPluginParams>,
      overrides?: UserOperationOverrides
    ) => {
      if (!provider.isConnected<IMSCA<any, any>>())
        throw new Error("provider is not connected to an MSCA account");
      return uninstallPlugin_({ ...params, pluginAddress }, overrides);
    },
    [provider, uninstallPlugin_, pluginAddress]
  );

  const isPluginInstalled = useCallback(async () => {
    const { getInstalledPlugins } = provider.isConnected<IMSCA<any, any>>()
      ? accountLoupeDecorators(provider.account)
      : { getInstalledPlugins: () => [] };
    const plugins = await getInstalledPlugins();
    return plugins.some((p) => p === pluginAddress);
  }, [pluginAddress, provider]);

  return {
    pluginAddress,
    ...(provider.isConnected<IMSCA<any, any>>()
      ? { ...accountMethods(provider.account), ...providerMethods(provider) }
      : {}),
    uninstallPlugin,
    isPluginInstalled,
  };
};
