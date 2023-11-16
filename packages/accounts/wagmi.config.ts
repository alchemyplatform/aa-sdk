import { defineConfig } from "@wagmi/cli";
import { plugingen } from "./scripts/plugingen.js";
import { MultiOwnerPluginAbi } from "./src/msca/abis/MultiOwnerPlugin.js";

export default defineConfig({
  out: "./src/msca/plugins/multi-owner.ts",
  contracts: [
    {
      name: "MultiOwnerPlugin",
      abi: MultiOwnerPluginAbi,
      address: "0xc56d2f3da0c2039525c95f3a71676895d9a8cae8",
    },
  ],
  plugins: [plugingen()],
});
