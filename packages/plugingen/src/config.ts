import type { Abi, Address, Chain, Hex, parseAbiParameters } from "viem";
import { sepolia } from "viem/chains";
import type { MaybeArray, MaybePromise } from "./types";

export type PluginConfig = {
  abi: Abi;
  addresses: Record<number, Address>;
  // allows you to override the root config chain
  chain?: Chain;
  // allows you to override the root config rpcUrl
  rpcUrl?: string;
  name: string;
  installConfig?: {
    initAbiParams: ReturnType<typeof parseAbiParameters> | [];
    dependencies?: {
      plugin: PluginConfig;
      functionId: Hex;
    }[];
  };
};

export type Config = {
  chain: Chain;
  rpcUrl: string;
  outDir?: string;
  plugins: PluginConfig[];
};

export function defineConfig(
  config: MaybeArray<Config> | (() => MaybePromise<MaybeArray<Config>>),
) {
  return config;
}

export const defaultConfig = {
  outDir: "./src/generated",
  chain: sepolia,
  rpcUrl: "https://ethereum-sepolia.publicnode.com",
  plugins: [],
} satisfies Config;
