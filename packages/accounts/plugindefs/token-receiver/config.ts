import { sepolia } from "@alchemy/aa-core";
import type { PluginGenConfig } from "../types";
import { TokenReceiverPluginAbi } from "./abi.js";

export const TokenReceiverPluginGenConfig: PluginGenConfig = {
  name: "TokenReceiverPlugin",
  abi: TokenReceiverPluginAbi,
  addresses: {
    [sepolia.id]: "0x360b59D3D922fe6b015257390b35E7dBA8632A50",
  },
  chain: sepolia,
  installConfig: {
    initAbiParams: [],
  },
};
