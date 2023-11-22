import type { ISmartAccountProvider } from "@alchemy/aa-core";
import { encodeFunctionData, type Address, type Hash } from "viem";
import { IPluginManagerAbi } from "../abis/IPluginManager.js";
import type { MSCA } from "../builder.js";

export type UninstallPluginParams = {
  pluginAddress: Address;
  config?: Hash;
  pluginUninstallData?: Hash;
  hookUnapplyData?: Hash[];
};

export async function uninstallPlugin<
  P extends ISmartAccountProvider & { account: MSCA }
>(provider: P, params: UninstallPluginParams) {
  const callData = encodeFunctionData({
    abi: IPluginManagerAbi,
    functionName: "uninstallPlugin",
    args: [
      params.pluginAddress,
      params.config ?? "0x",
      params.pluginUninstallData ?? "0x",
      params.hookUnapplyData ?? [],
    ],
  });

  return provider.sendUserOperation(callData);
}
