import type {
  GetEntryPointFromAccount,
  SendUserOperationResult,
  SmartContractAccount,
} from "@aa-sdk/core";
import type { Chain, Client, Transport } from "viem";
import { installPlugin, type InstallPluginParams } from "./installPlugin.js";
import {
  uninstallPlugin,
  type UninstallPluginParams,
} from "./uninstallPlugin.js";

export { type InstallPluginParams } from "./installPlugin.js";
export { type UninstallPluginParams } from "./uninstallPlugin.js";

export type PluginManagerActions<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TEntryPointVersion extends
    GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>,
> = {
  installPlugin: (
    params: InstallPluginParams<TAccount>,
  ) => Promise<SendUserOperationResult<TEntryPointVersion>>;
  uninstallPlugin: (
    params: UninstallPluginParams<TAccount>,
  ) => Promise<SendUserOperationResult<TEntryPointVersion>>;
};

/**
 * Provides actions for managing plugins on a given client, including installing and uninstalling plugins.
 * NOTE: this is provided by default when using a modular account client
 *
 * @example
 * ```ts
 * import { pluginManagerActions } from "@account-kit/smart-contracts";
 * import { createSmartAccountClient } from "@aa-sdk/core";
 *
 * const client = createSmartAccountClient(...).extend(pluginManagerActions);
 * ```
 *
 * @param {Client<TTransport, TChain, TAccount>} client The client instance on which to manage plugins
 * @returns {PluginManagerActions<TAccount>} An object containing functions to install and uninstall plugins
 */
export function pluginManagerActions<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
>(
  client: Client<TTransport, TChain, TAccount>,
): PluginManagerActions<TAccount> {
  return {
    installPlugin: async (params) => installPlugin(client, params),
    uninstallPlugin: async (params) => uninstallPlugin(client, params),
  };
}
