import { sepolia } from "viem/chains";
import type { PluginGenConfig } from "../types";
import { MultiOwnerPluginAbi } from "./abi.js";

export const MultiOwnerPluginAddress =
  "0x56bC629F342821FBe91C5273880792dFECBE7920";

export const MultiOwnerPluginGenConfig: PluginGenConfig = {
  name: "MultiOwnerPlugin",
  abi: MultiOwnerPluginAbi,
  address: MultiOwnerPluginAddress,
  chain: sepolia,
};
