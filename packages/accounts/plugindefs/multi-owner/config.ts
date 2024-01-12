import { parseAbiParameters } from "viem";
import { sepolia } from "viem/chains";
import type { PluginGenConfig } from "../types";
import { MultiOwnerPluginAbi } from "./abi.js";

export const MultiOwnerPluginGenConfig: PluginGenConfig = {
  name: "MultiOwnerPlugin",
  abi: MultiOwnerPluginAbi,
  addresses: {
    [sepolia.id]: "0x56bC629F342821FBe91C5273880792dFECBE7920",
  },
  chain: sepolia,
  installConfig: {
    initAbiParams: parseAbiParameters("address[]"),
  },
};
