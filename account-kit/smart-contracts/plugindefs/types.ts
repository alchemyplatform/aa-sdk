import type { Abi, Address, Chain, Hex, parseAbiParameters } from "viem";

export type PluginGenConfig = {
  abi: Abi;
  addresses: Record<number, Address>;
  chain: Chain;
  name: string;
  rpcUrl?: string;
  installConfig?: {
    initAbiParams: ReturnType<typeof parseAbiParameters> | [];
    dependencies?: {
      plugin: PluginGenConfig;
      functionId: Hex;
    }[];
  };
};
