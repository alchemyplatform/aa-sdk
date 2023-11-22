import type { ISmartAccountProvider } from "@alchemy/aa-core";
import type { MSCA } from "../builder";
import { installPlugin, type InstallPluginParams } from "./installPlugin.js";
import {
  uninstallPlugin,
  type UninstallPluginParams,
} from "./uninstallPlugin.js";

export const pluginManagerDecorator = <
  P extends ISmartAccountProvider & { account: MSCA }
>(
  provider: P
) => ({
  installPlugin: (params: InstallPluginParams) =>
    installPlugin<P>(provider, params),
  uninstallPlugin: (params: UninstallPluginParams) =>
    uninstallPlugin<P>(provider, params),
});
