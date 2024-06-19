import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  fraxtal,
  fraxtalSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonAmoy,
  polygonMumbai,
  sepolia,
  zora,
  zoraSepolia,
} from "@aa-sdk/core";
import type { PluginConfig } from "@account-kit/plugingen";
import { parseAbiParameters } from "viem";
import { MultiOwnerPluginAbi } from "./abi.js";

export const MultiOwnerPluginGenConfig: PluginConfig = {
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
    [mainnet.id]: "0xcE0000007B008F50d762D155002600004cD6c647",
  },
  installConfig: {
    initAbiParams: parseAbiParameters("address[]"),
  },
};
