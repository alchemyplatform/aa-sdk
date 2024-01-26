import type {
  ISmartAccountProvider,
  UserOperationOverrides,
} from "@alchemy/aa-core";
import { encodeFunctionData, type Address, type Hash } from "viem";
import { IPluginManagerAbi } from "../abis/IPluginManager.js";
import type { IMSCA } from "../types.js";

export type UninstallPluginParams = {
  pluginAddress: Address;
  config?: Hash;
  pluginUninstallData?: Hash;
};

export async function uninstallPlugin<
  P extends ISmartAccountProvider & { account: IMSCA }
>(
  provider: P,
  params: UninstallPluginParams,
  overrides?: UserOperationOverrides
) {
  const callData = await encodeUninstallPluginUserOperation(params);
  return provider.sendUserOperation(callData, overrides);
}

export async function encodeUninstallPluginUserOperation(
  params: UninstallPluginParams
) {
  return encodeFunctionData({
    abi: IPluginManagerAbi,
    functionName: "uninstallPlugin",
    args: [
      params.pluginAddress,
      params.config ?? "0x",
      params.pluginUninstallData ?? "0x",
    ],
  });
}
