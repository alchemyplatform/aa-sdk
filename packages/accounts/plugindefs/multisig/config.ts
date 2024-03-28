import { sepolia } from "@alchemy/aa-core";
import { parseAbiParameters } from "viem";
import type { PluginGenConfig } from "../types";
import { MultisigPluginAbi } from "./abi.js";

export const MultisigPluginGenConfig: PluginGenConfig = {
  name: "MultisigPlugin",
  abi: MultisigPluginAbi,
  addresses: {
    [sepolia.id]: "0x0b135A12EB2f7b441DCcE5F7DE07DB65AE7c4649",
  },
  chain: sepolia,
  installConfig: {
    initAbiParams: parseAbiParameters("address[], uint"),
  },
};
