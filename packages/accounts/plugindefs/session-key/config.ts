import { baseSepolia, polygon, sepolia } from "@alchemy/aa-core";
import { parseAbiParameters } from "viem";
import { MultiOwnerPluginGenConfig } from "../multi-owner/config.js";
import type { PluginGenConfig } from "../types";
import { SessionKeyPluginAbi } from "./abi.js";

export const SessionKeyPluginGenConfig: PluginGenConfig = {
  name: "SessionKeyPlugin",
  abi: SessionKeyPluginAbi,
  addresses: {
    [sepolia.id]: "0x000000AAF83f4cbd58193D30643025ffD6C9e724",
    [baseSepolia.id]: "0x000000AAF83f4cbd58193D30643025ffD6C9e724",
    [polygon.id]: "0x000000AAF83f4cbd58193D30643025ffD6C9e724",
  },
  chain: sepolia,
  installConfig: {
    initAbiParams: parseAbiParameters(
      "address[] initialKeys, bytes32[] tags, bytes[][] initialPermissions"
    ),
    dependencies: [
      {
        plugin: MultiOwnerPluginGenConfig,
        functionId: "0x1",
      },
      {
        plugin: MultiOwnerPluginGenConfig,
        functionId: "0x0",
      },
    ],
  },
};
