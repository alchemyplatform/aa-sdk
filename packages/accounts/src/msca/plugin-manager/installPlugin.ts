import type { ISmartAccountProvider } from "@alchemy/aa-core";
import {
  encodeFunctionData,
  encodeFunctionResult,
  keccak256,
  type Address,
  type Hash,
} from "viem";
import { IPluginAbi } from "../abis/IPlugin.js";
import { IPluginManagerAbi } from "../abis/IPluginManager.js";
import type { IMSCA } from "../builder.js";
import type { InjectedHook } from "./types";

export type InstallPluginParams = {
  pluginAddress: Address;
  manifestHash?: Hash;
  pluginInitData?: Hash;
  dependencies?: Address[];
  injectedHooks?: InjectedHook[];
};

export async function installPlugin<
  P extends ISmartAccountProvider & { account: IMSCA }
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

  const callData = encodeFunctionData({
    abi: IPluginManagerAbi,
    functionName: "installPlugin",
    args: [
      params.pluginAddress,
      manifestHash,
      params.pluginInitData ?? "0x",
      params.dependencies ?? [],
      params.injectedHooks ?? [],
    ],
  });

  return provider.sendUserOperation(callData);
}
