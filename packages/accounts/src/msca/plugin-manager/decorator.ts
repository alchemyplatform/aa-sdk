import type {
  GetEntryPointFromAccount,
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
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
> = {
  installPlugin: (
    params: InstallPluginParams<TAccount>
  ) => Promise<SendUserOperationResult<TEntryPointVersion>>;
  uninstallPlugin: (
    params: UninstallPluginParams<TAccount>
  ) => Promise<SendUserOperationResult<TEntryPointVersion>>;
};

export const pluginManagerActions: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
) => PluginManagerActions<TAccount> = (client) => ({
  installPlugin: async (params) => installPlugin(client, params),
  uninstallPlugin: async (params) => uninstallPlugin(client, params),
});
