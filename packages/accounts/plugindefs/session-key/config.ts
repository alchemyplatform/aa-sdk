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
import { MultiOwnerPluginGenConfig } from "../multi-owner/config.js";
import type { PluginGenConfig } from "../types";
import { SessionKeyPluginAbi } from "./abi.js";

export const SessionKeyPluginGenConfig: PluginGenConfig = {
  name: "SessionKeyPlugin",
  abi: SessionKeyPluginAbi,
  addresses: {
    [mainnet.id]: "0x0000005B4b6A5a890fCD500095738Cb17B4DD042",
    [optimism.id]: "0x0000005B4b6A5a890fCD500095738Cb17B4DD042",
    [arbitrum.id]: "0x0000005B4b6A5a890fCD500095738Cb17B4DD042",
    [polygon.id]: "0x0000005B4b6A5a890fCD500095738Cb17B4DD042",
    [base.id]: "0x0000005B4b6A5a890fCD500095738Cb17B4DD042",

    [sepolia.id]: "0x0000005B4b6A5a890fCD500095738Cb17B4DD042",
    [optimismSepolia.id]: "0x0000005B4b6A5a890fCD500095738Cb17B4DD042",
    [arbitrumSepolia.id]: "0x0000005B4b6A5a890fCD500095738Cb17B4DD042",
    [polygonMumbai.id]: "0x0000005B4b6A5a890fCD500095738Cb17B4DD042",
    [baseSepolia.id]: "0x0000005B4b6A5a890fCD500095738Cb17B4DD042",
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
