import { defineConfig } from "@wagmi/cli";
import { kebabCase } from "change-case";
import dotenv from "dotenv";
import * as configs from "./plugindefs/index.js";
import { plugingen } from "./plugingen/index.js";
dotenv.config();

const pluginConfigs = Object.values(configs);
const pluginRegEx: RegExp = /[pP]lugin/g;

export default defineConfig(
  pluginConfigs.map((config) => ({
    out: `./src/msca/plugins/${kebabCase(
      config.name.replaceAll(pluginRegEx, "")
    )}/plugin.ts`,
    contracts: [
      {
        name: config.name,
        abi: config.abi,
        address: config.addresses,
      },
    ],
    plugins: [
      plugingen({
        chain: config.chain,
        connectionConfig: {
          rpcUrl:
            config.rpcUrl ||
            (config.chain.rpcUrls?.default?.http.length > 0
              ? config.chain.rpcUrls.default.http[0]
              : `https://${config.chain.name
                  .toLowerCase()
                  .replace("-testnet", "")}-rpc.publicnode.com`),
        },
        config,
      }),
    ],
  }))
);
