import { defineConfig } from "@wagmi/cli";
import { kebabCase } from "change-case";
import dotenv from "dotenv";
import * as configs from "./plugindefs/index.js";
import { plugingen } from "./scripts/plugingen.js";
dotenv.config();

const pluginConfigs = Object.values(configs);
const pluginRegEx: RegExp = /[pP]lugin/g;

export default defineConfig(
  pluginConfigs.map((config) => ({
    out: `./src/msca/plugins/${kebabCase(
      config.name.replaceAll(pluginRegEx, "")
    )}.ts`,
    contracts: [
      {
        name: config.name,
        abi: config.abi,
        address: config.address,
      },
    ],
    plugins: [plugingen({ chain: config.chain, rpcUrl: config.rpcUrl })],
  }))
);
