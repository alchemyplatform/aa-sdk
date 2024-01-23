import { parseAbiParameters } from "viem";
import { sepolia } from "viem/chains";
import type { PluginGenConfig } from "../types";
import { MultiOwnerPluginAbi } from "./abi.js";

export const MultiOwnerPluginGenConfig: PluginGenConfig = {
  name: "MultiOwnerPlugin",
  abi: MultiOwnerPluginAbi,
  addresses: {
    [sepolia.id]: "0x90d4f511c9Ca2B1694eA2A1629130B430853aBeB",
  },
  chain: sepolia,
  installConfig: {
    initAbiParams: parseAbiParameters("address[]"),
  },
};
