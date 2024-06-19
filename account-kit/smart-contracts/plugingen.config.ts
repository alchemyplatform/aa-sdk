import { defineConfig } from "@account-kit/plugingen";
import { sepolia } from "viem/chains";
import {
  MultiOwnerPluginGenConfig,
  MultisigPluginGenConfig,
  SessionKeyPluginGenConfig,
} from "./plugindefs/index.js";

export default defineConfig({
  outDir: "./src/msca/plugins",
  chain: sepolia,
  rpcUrl: "https://ethereum-sepolia.publicnode.com",
  plugins: [
    MultiOwnerPluginGenConfig,
    MultisigPluginGenConfig,
    SessionKeyPluginGenConfig,
  ],
});
