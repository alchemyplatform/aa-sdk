import { sepolia } from "@alchemy/aa-core";
import { parseAbiParameters } from "viem";
import type { PluginGenConfig } from "../types";
import { MultisigPluginAbi } from "./abi.js";

export const MultisigPluginGenConfig: PluginGenConfig = {
  name: "MultisigPlugin",
  abi: MultisigPluginAbi,
  addresses: {
    [sepolia.id]: "0x6571A72DfA6BD4AD779587c968F40f9fD52c57Ef",
  },
  chain: sepolia,
  installConfig: {
    initAbiParams: parseAbiParameters("address[], uint"),
  },
};
