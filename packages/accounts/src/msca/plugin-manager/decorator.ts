import type {
  EntryPointVersion,
  SendUserOperationResult,
  SmartContractAccount,
} from "@alchemy/aa-core";
import type { Chain, Client, Transport } from "viem";
import { installPlugin, type InstallPluginParams } from "./installPlugin.js";
import {
  uninstallPlugin,
  type UninstallPluginParams,
} from "./uninstallPlugin.js";

export { type InstallPluginParams } from "./installPlugin.js";
export { type UninstallPluginParams } from "./uninstallPlugin.js";

export type PluginManagerActions<
  TEntryPointVersion extends EntryPointVersion,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
> = {
  installPlugin: (
    params: InstallPluginParams<TEntryPointVersion, TAccount>
  ) => Promise<SendUserOperationResult<TEntryPointVersion>>;
  uninstallPlugin: (
    params: UninstallPluginParams<TEntryPointVersion, TAccount>
  ) => Promise<SendUserOperationResult<TEntryPointVersion>>;
};

export const pluginManagerActions: <
  TEntryPointVersion extends EntryPointVersion,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
) => PluginManagerActions<TEntryPointVersion, TAccount> = (client) => ({
  installPlugin: async (params) => installPlugin(client, params),
  uninstallPlugin: async (params) => uninstallPlugin(client, params),
});
