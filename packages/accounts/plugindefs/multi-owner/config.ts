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
    [mainnet.id]: "0x000000E8F14A838A00505d861c6EF15cdfB05455",
    [optimism.id]: "0x000000E8F14A838A00505d861c6EF15cdfB05455",
    [arbitrum.id]: "0x000000E8F14A838A00505d861c6EF15cdfB05455",
    [polygon.id]: "0x000000E8F14A838A00505d861c6EF15cdfB05455",
    [base.id]: "0x000000E8F14A838A00505d861c6EF15cdfB05455",

    [sepolia.id]: "0x000000E8F14A838A00505d861c6EF15cdfB05455",
    [optimismSepolia.id]: "0x000000E8F14A838A00505d861c6EF15cdfB05455",
    [arbitrumSepolia.id]: "0x000000E8F14A838A00505d861c6EF15cdfB05455",
    [polygonMumbai.id]: "0x000000E8F14A838A00505d861c6EF15cdfB05455",
    [baseSepolia.id]: "0x000000E8F14A838A00505d861c6EF15cdfB05455",
  },
  chain: sepolia,
  installConfig: {
    initAbiParams: parseAbiParameters("address[]"),
  },
};
