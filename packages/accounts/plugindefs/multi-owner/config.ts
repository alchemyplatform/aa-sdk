import { sepolia } from "@alchemy/aa-core";
import { parseAbiParameters } from "viem";
import type { PluginGenConfig } from "../types";
import { MultiOwnerPluginAbi } from "./abi.js";

export const MultiOwnerPluginGenConfig: PluginGenConfig = {
  name: "MultiOwnerPlugin",
  abi: MultiOwnerPluginAbi,
  addresses: {
    [sepolia.id]: "0xB76734F322b9f2C8F1dA934252dED3bC3C25b109",
  },
  chain: sepolia,
  installConfig: {
    initAbiParams: parseAbiParameters("address[]"),
  },
};
