import { defineConfig } from "@account-kit/plugingen";
import dotenv from "dotenv";
import { sepolia } from "viem/chains";
import {
  MultiOwnerPluginGenConfig,
  MultisigPluginGenConfig,
  SessionKeyPluginGenConfig,
} from "./plugindefs/index.js";
dotenv.config();

export default defineConfig({
  outDir: "./src/msca/plugins",
  chain: sepolia,
  rpcUrl:
    process.env.VITEST_SEPOLIA_FORK_URL ??
    "https://ethereum-sepolia.publicnode.com",
  plugins: [
    MultiOwnerPluginGenConfig,
    MultisigPluginGenConfig,
    SessionKeyPluginGenConfig,
  ],
});
