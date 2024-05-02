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
} from "@alchemy/aa-core";
import { parseAbiParameters } from "viem";
import type { PluginGenConfig } from "../types";
import { MultiOwnerPluginAbi } from "./abi.js";

export const MultiOwnerPluginGenConfig: PluginGenConfig = {
  name: "MultiOwnerPlugin",
  abi: MultiOwnerPluginAbi,
  addresses: {
    [sepolia.id]: "0xcE0000007B008F50d762D155002600004cD6c647",
    [baseSepolia.id]: "0xcE0000007B008F50d762D155002600004cD6c647",
    [polygon.id]: "0xcE0000007B008F50d762D155002600004cD6c647",
    [polygonAmoy.id]: "0xcE0000007B008F50d762D155002600004cD6c647",
    [polygonMumbai.id]: "0xcE0000007B008F50d762D155002600004cD6c647",
    [optimism.id]: "0xcE0000007B008F50d762D155002600004cD6c647",
    [optimismSepolia.id]: "0xcE0000007B008F50d762D155002600004cD6c647",
    [arbitrum.id]: "0xcE0000007B008F50d762D155002600004cD6c647",
    [arbitrumSepolia.id]: "0xcE0000007B008F50d762D155002600004cD6c647",
    [base.id]: "0xcE0000007B008F50d762D155002600004cD6c647",
    [baseSepolia.id]: "0xcE0000007B008F50d762D155002600004cD6c647",
    [fraxtal.id]: "0xcE0000007B008F50d762D155002600004cD6c647",
    [fraxtalSepolia.id]: "0xcE0000007B008F50d762D155002600004cD6c647",
    [zora.id]: "0xcE0000007B008F50d762D155002600004cD6c647",
    [zoraSepolia.id]: "0xcE0000007B008F50d762D155002600004cD6c647",
  },
  chain: sepolia,
  installConfig: {
    initAbiParams: parseAbiParameters("address[]"),
  },
};
