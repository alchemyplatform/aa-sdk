import { sepolia } from "viem/chains";
import type { PluginGenConfig } from "../types";
import { TokenReceiverPluginAbi } from "./abi.js";

export const TokenReceiverPluginGenConfig: PluginGenConfig = {
  name: "TokenReceiverPlugin",
  abi: TokenReceiverPluginAbi,
  addresses: {
    [sepolia.id]: "0xa81C0AEaB22b21b4da8d8728063f6570384b48C9",
  },
  chain: sepolia,
};
