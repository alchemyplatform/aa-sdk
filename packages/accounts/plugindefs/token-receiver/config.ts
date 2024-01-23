import { sepolia } from "viem/chains";
import type { PluginGenConfig } from "../types";
import { TokenReceiverPluginAbi } from "./abi.js";

export const TokenReceiverPluginGenConfig: PluginGenConfig = {
  name: "TokenReceiverPlugin",
  abi: TokenReceiverPluginAbi,
  addresses: {
    [sepolia.id]: "0x4FCDe5A446208a20A1539FC425832334bc8360Fb",
  },
  chain: sepolia,
  installConfig: {
    initAbiParams: [],
  },
};
