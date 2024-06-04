import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  optimism,
  optimismSepolia,
  polygon,
  polygonAmoy,
  polygonMumbai,
  sepolia,
  fraxtal,
  fraxtalSepolia,
  zora,
  zoraSepolia,
  mainnet,
} from "@alchemy/aa-core";
import { parseAbiParameters } from "viem";
import { MultiOwnerPluginGenConfig } from "../multi-owner/config.js";
import type { PluginGenConfig } from "../types";
import { SessionKeyPluginAbi } from "./abi.js";

export const SessionKeyPluginGenConfig: PluginGenConfig = {
  name: "SessionKeyPlugin",
  abi: SessionKeyPluginAbi,
  addresses: {
    [sepolia.id]: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d",
    [baseSepolia.id]: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d",
    [polygon.id]: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d",
    [polygonAmoy.id]: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d",
    [polygonMumbai.id]: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d",
    [optimism.id]: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d",
    [optimismSepolia.id]: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d",
    [arbitrum.id]: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d",
    [arbitrumSepolia.id]: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d",
    [base.id]: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d",
    [baseSepolia.id]: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d",
    [fraxtal.id]: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d",
    [fraxtalSepolia.id]: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d",
    [zora.id]: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d",
    [zoraSepolia.id]: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d",
    [mainnet.id]: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d",
  },
  chain: sepolia,
  installConfig: {
    initAbiParams: parseAbiParameters(
      "address[] initialKeys, bytes32[] tags, bytes[][] initialPermissions"
    ),
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
