import type {
  ISmartAccountProvider,
  UserOperationOverrides,
} from "@alchemy/aa-core";
import type { IMSCA } from "../types.js";
import { installPlugin, type InstallPluginParams } from "./installPlugin.js";
import {
  uninstallPlugin,
  type UninstallPluginParams,
} from "./uninstallPlugin.js";

export const pluginManagerDecorator = <
  P extends ISmartAccountProvider & { account: IMSCA }
>(
  provider: P
) => ({
  installPlugin: (
    params: InstallPluginParams,
    overrides?: UserOperationOverrides
  ) => installPlugin<P>(provider, params, overrides),
  uninstallPlugin: (
    params: UninstallPluginParams,
    overrides?: UserOperationOverrides
  ) => uninstallPlugin<P>(provider, params, overrides),
});
