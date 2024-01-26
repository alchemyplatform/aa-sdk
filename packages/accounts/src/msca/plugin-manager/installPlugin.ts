import type {
  ISmartAccountProvider,
  UserOperationOverrides,
} from "@alchemy/aa-core";
import {
  encodeFunctionData,
  encodeFunctionResult,
  keccak256,
  type Address,
  type Hash,
} from "viem";
import { IPluginAbi } from "../abis/IPlugin.js";
import { IPluginManagerAbi } from "../abis/IPluginManager.js";
import type { FunctionReference } from "../account-loupe/types.js";
import type { IMSCA } from "../types.js";

export type InstallPluginParams = {
  pluginAddress: Address;
  manifestHash?: Hash;
  pluginInitData?: Hash;
  dependencies?: FunctionReference[];
};

export async function installPlugin<
  P extends ISmartAccountProvider & { account: IMSCA<any, any, any> }
>(
  provider: P,
  params: InstallPluginParams,
  overrides?: UserOperationOverrides
) {
  const callData = await encodeInstallPluginUserOperation(provider, params);
  return provider.sendUserOperation(callData, overrides);
}

export async function encodeInstallPluginUserOperation<
  P extends ISmartAccountProvider & { account: IMSCA<any, any, any> }
>(provider: P, params: InstallPluginParams) {
  const pluginManifest = await provider.rpcClient.readContract({
    abi: IPluginAbi,
    address: params.pluginAddress,
    functionName: "pluginManifest",
  });
  // use the manifest hash passed in or get it from the plugin
  const manifestHash: Hash =
    params.manifestHash ??
    keccak256(
      encodeFunctionResult({
        abi: IPluginAbi,
        functionName: "pluginManifest",
        result: pluginManifest,
      })
    );
  return encodeFunctionData({
    abi: IPluginManagerAbi,
    functionName: "installPlugin",
    args: [
      params.pluginAddress,
      manifestHash,
      params.pluginInitData ?? "0x",
      params.dependencies ?? [],
    ],
  });
}
