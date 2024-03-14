import { arbitrumSepolia } from "@alchemy/aa-core";
import { parseAbiParameters } from "viem";
import { MultiOwnerPluginGenConfig } from "../multi-owner/config.js";
import type { PluginGenConfig } from "../types.js";
import { ColdStoragePluginAbi } from "./abi.js";

export const ColdStoragePluginGenConfig: PluginGenConfig = {
  name: "ColdStoragePlugin",
  abi: ColdStoragePluginAbi,
  addresses: {
    [arbitrumSepolia.id]: "0x63008C1f1a179C4109C8c176C174106328Bd3521",
  },
  chain: arbitrumSepolia,
  installConfig: {
    initAbiParams: parseAbiParameters("address storageKey"),
    dependencies: [
      {
        plugin: MultiOwnerPluginGenConfig,
        functionId: "0x0",
      },
      {
        plugin: MultiOwnerPluginGenConfig,
        functionId: "0x1",
      },
    ],
  },
};
