import { sepolia } from "viem/chains";
import type { PluginGenConfig } from "../types";
import { MultiOwnerPluginAbi } from "./abi.js";

export const MultiOwnerPluginGenConfig: PluginGenConfig = {
  name: "MultiOwnerPlugin",
  abi: MultiOwnerPluginAbi,
  address: "0x80b6412d1cB5bE749Cd33Ae363AE40c56897C8A6",
  chain: sepolia,
};
