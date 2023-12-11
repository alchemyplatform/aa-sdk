import type { ContractConfig } from "@wagmi/cli";
import type { Abi, Chain } from "viem";

export type PluginGenConfig = {
  abi: Abi;
  address: ContractConfig["address"];
  chain: Chain;
  name: string;
  // TODO: need to make this configurable to run in CI without requiring this
  rpcUrl?: string;
};
