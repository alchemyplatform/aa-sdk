import type { PluginConfig } from "@account-kit/plugingen";
import { parseAbiParameters } from "viem";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  fraxtal,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonAmoy,
  sepolia,
  zora,
  zoraSepolia,
} from "viem/chains";
import { MultisigPluginAbi } from "./abi.js";

export const MultisigPluginGenConfig: PluginConfig = {
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
    2523: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7",
    [zora.id]: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7",
    [zoraSepolia.id]: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7",
  },
  installConfig: {
    initAbiParams: parseAbiParameters("address[], uint"),
  },
};
