import {
  baseSepolia,
  sepolia,
  polygon,
  mainnet,
  polygonAmoy,
  optimism,
  optimismSepolia,
  arbitrum,
  arbitrumSepolia,
  base,
  fraxtal,
  fraxtalSepolia,
  zora,
  zoraSepolia,
} from "@alchemy/aa-core";
import { parseAbiParameters } from "viem";
import type { PluginGenConfig } from "../types";
import { MultisigPluginAbi } from "./abi.js";

export const MultisigPluginGenConfig: PluginGenConfig = {
  name: "MultisigPlugin",
  abi: MultisigPluginAbi,
  addresses: {
    [sepolia.id]: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7",
    [baseSepolia.id]: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7",
    [polygon.id]: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7",
    [mainnet.id]: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7",
    [polygonAmoy.id]: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7",
    [optimism.id]: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7",
    [optimismSepolia.id]: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7",
    [arbitrum.id]: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7",
    [arbitrumSepolia.id]: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7",
    [base.id]: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7",
    [fraxtal.id]: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7",
    [fraxtalSepolia.id]: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7",
    [zora.id]: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7",
    [zoraSepolia.id]: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7",
  },
  chain: sepolia,
  installConfig: {
    initAbiParams: parseAbiParameters("address[], uint"),
  },
};
