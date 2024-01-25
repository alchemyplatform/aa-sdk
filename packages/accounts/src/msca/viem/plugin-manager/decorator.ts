import type { SendUserOperationResult } from "@alchemy/aa-core";
import type {
  SmartAccountClient,
  SmartContractAccount,
} from "@alchemy/aa-core/viem";
import type { Chain, Transport } from "viem";
import { installPlugin, type InstallPluginParams } from "./installPlugin.js";
import {
  uninstallPlugin,
  type UninstallPluginParams,
} from "./uninstallPlugin.js";

export type PluginManagerActions<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = {
  installPlugin: (
    params: InstallPluginParams<TAccount>
  ) => Promise<SendUserOperationResult>;
  uninstallPlugin: (
    params: UninstallPluginParams<TAccount>
  ) => Promise<SendUserOperationResult>;
};

export const pluginManagerActions: <
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: SmartAccountClient<TTransport, TChain, TAccount>
) => PluginManagerActions<TAccount> = (client) => ({
  installPlugin: async (params) => installPlugin(client, params),
  uninstallPlugin: async (params) => uninstallPlugin(client, params),
});
