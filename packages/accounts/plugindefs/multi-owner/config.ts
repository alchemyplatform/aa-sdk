import { baseSepolia, polygon, sepolia } from "@alchemy/aa-core";
import { parseAbiParameters } from "viem";
import type { PluginGenConfig } from "../types";
import { MultiOwnerPluginAbi } from "./abi.js";

export const MultiOwnerPluginGenConfig: PluginGenConfig = {
  name: "MultiOwnerPlugin",
  abi: MultiOwnerPluginAbi,
  addresses: {
    [sepolia.id]: "0x000000E8F14A838A00505d861c6EF15cdfB05455",
    [baseSepolia.id]: "0x000000E8F14A838A00505d861c6EF15cdfB05455",
    [polygon.id]: "0x000000E8F14A838A00505d861c6EF15cdfB05455",
  },
  chain: sepolia,
  installConfig: {
    initAbiParams: parseAbiParameters("address[]"),
  },
};
