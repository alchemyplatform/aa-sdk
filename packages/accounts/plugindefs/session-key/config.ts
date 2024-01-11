import { parseAbiParameters } from "viem";
import { sepolia } from "viem/chains";
import { MultiOwnerPluginGenConfig } from "../multi-owner/config.js";
import type { PluginGenConfig } from "../types";
import { SessionKeyPluginAbi } from "./abi.js";

export const SessionKeyPluginGenConfig: PluginGenConfig = {
  name: "SessionKeyPlugin",
  abi: SessionKeyPluginAbi,
  addresses: {
    [sepolia.id]: "0x60ae6D5887a67E18afDfA5786A8598464C123A07",
  },
  chain: sepolia,
  installConfig: {
    initAbiParams: parseAbiParameters("address[] initialPublicKeys"),
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
