import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonMumbai,
  sepolia,
} from "@alchemy/aa-core";
import { parseAbiParameters } from "viem";
import type { PluginGenConfig } from "../types";
import { MultiOwnerPluginAbi } from "./abi.js";

export const MultiOwnerPluginGenConfig: PluginGenConfig = {
  name: "MultiOwnerPlugin",
  abi: MultiOwnerPluginAbi,
  addresses: {
    [mainnet.id]: "0xcE0000007B008F50d762D155002600004cD6c647",
    [optimism.id]: "0xcE0000007B008F50d762D155002600004cD6c647",
    [arbitrum.id]: "0xcE0000007B008F50d762D155002600004cD6c647",
    [polygon.id]: "0xcE0000007B008F50d762D155002600004cD6c647",
    [base.id]: "0xcE0000007B008F50d762D155002600004cD6c647",

    [sepolia.id]: "0xcE0000007B008F50d762D155002600004cD6c647",
    [optimismSepolia.id]: "0xcE0000007B008F50d762D155002600004cD6c647",
    [arbitrumSepolia.id]: "0xcE0000007B008F50d762D155002600004cD6c647",
    [polygonMumbai.id]: "0xcE0000007B008F50d762D155002600004cD6c647",
    [baseSepolia.id]: "0xcE0000007B008F50d762D155002600004cD6c647",
  },
  chain: sepolia,
  installConfig: {
    initAbiParams: parseAbiParameters("address[]"),
  },
};
